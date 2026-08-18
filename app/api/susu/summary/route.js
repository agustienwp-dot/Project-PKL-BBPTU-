import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const targetDateStr = searchParams.get('date') || new Date().toISOString().split('T')[0];

    const startOfDay = new Date(targetDateStr);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDateStr);
    endOfDay.setHours(23, 59, 59, 999);

    // 1. Overall lifetime aggregates up to end of selected date
    const [
      receptionBefore,
      receptionToday,
      processingBefore,
      processingToday,
      distBefore,
      distToday,
    ] = await Promise.all([
      // Raw Milk Received before today
      prisma.milkReception.aggregate({
        where: { date: { lt: startOfDay } },
        _sum: { volumeLiters: true },
      }),
      // Raw Milk Received today
      prisma.milkReception.aggregate({
        where: { date: { gte: startOfDay, lte: endOfDay } },
        _sum: { volumeLiters: true },
      }),
      // Raw Milk Processed before today
      prisma.milkProcessing.aggregate({
        where: { date: { lt: startOfDay } },
        _sum: { rawMilkUsedLiters: true, botolOutputQty: true, cupOutputQty: true, bantalOutputQty: true },
      }),
      // Raw Milk Processed today
      prisma.milkProcessing.aggregate({
        where: { date: { gte: startOfDay, lte: endOfDay } },
        _sum: { rawMilkUsedLiters: true, botolOutputQty: true, cupOutputQty: true, bantalOutputQty: true },
      }),
      // Packaged Milk Distributed before today
      prisma.milkDistribution.aggregate({
        where: { date: { lt: startOfDay } },
        _sum: { botolQty: true, cupQty: true, bantalQty: true },
      }),
      // Packaged Milk Distributed today
      prisma.milkDistribution.aggregate({
        where: { date: { gte: startOfDay, lte: endOfDay } },
        _sum: { botolQty: true, cupQty: true, bantalQty: true },
      }),
    ]);

    // Raw Milk Metrics (Liter)
    const rawInitialStock = (receptionBefore._sum.volumeLiters || 0) - (processingBefore._sum.rawMilkUsedLiters || 0);
    const rawInToday = receptionToday._sum.volumeLiters || 0;
    const totalRawAfterIn = rawInitialStock + rawInToday;
    const rawProcessedToday = processingToday._sum.rawMilkUsedLiters || 0;
    const rawRemainingEnd = totalRawAfterIn - rawProcessedToday;

    // Packaged Milk Output Today (Pcs)
    const botolOutputToday = processingToday._sum.botolOutputQty || 0;
    const cupOutputToday = processingToday._sum.cupOutputQty || 0;
    const bantalOutputToday = processingToday._sum.bantalOutputQty || 0;

    // Packaged Milk Distributed Today (Pcs)
    const botolDistToday = distToday._sum.botolQty || 0;
    const cupDistToday = distToday._sum.cupQty || 0;
    const bantalDistToday = distToday._sum.bantalQty || 0;

    // Total lifetime packaging balances
    const totalProcBotol = (processingBefore._sum.botolOutputQty || 0) + botolOutputToday;
    const totalDistBotol = (distBefore._sum.botolQty || 0) + botolDistToday;
    const botolFinalStock = totalProcBotol - totalDistBotol;

    const totalProcCup = (processingBefore._sum.cupOutputQty || 0) + cupOutputToday;
    const totalDistCup = (distBefore._sum.cupQty || 0) + cupDistToday;
    const cupFinalStock = totalProcCup - totalDistCup;

    const totalProcBantal = (processingBefore._sum.bantalOutputQty || 0) + bantalOutputToday;
    const totalDistBantal = (distBefore._sum.bantalQty || 0) + bantalDistToday;
    const bantalFinalStock = totalProcBantal - totalDistBantal;

    return NextResponse.json({
      success: true,
      data: {
        date: targetDateStr,
        rawMilk: {
          initialStockLiters: Math.max(0, rawInitialStock),
          inTodayLiters: rawInToday,
          totalStockAfterInLiters: Math.max(0, totalRawAfterIn),
          processedTodayLiters: rawProcessedToday,
          remainingStockLiters: Math.max(0, rawRemainingEnd),
        },
        packagedOutputToday: {
          botol: botolOutputToday,
          cup: cupOutputToday,
          bantal: bantalOutputToday,
        },
        packagedDistributedToday: {
          botol: botolDistToday,
          cup: cupDistToday,
          bantal: bantalDistToday,
        },
        packagedFinalRemainingStock: {
          botol: Math.max(0, botolFinalStock),
          cup: Math.max(0, cupFinalStock),
          bantal: Math.max(0, bantalFinalStock),
        },
      },
    });
  } catch (error) {
    console.error('GET /api/susu/summary error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
