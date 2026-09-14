/**
 * Trading Trends Wallet Engine
 * Handles automated calculation of $50/day growth from Monday to Friday.
 * Freezes growth on Saturdays and Sundays.
 */

export function calculateUserWallet(user, approvedWithdrawalsTotal = 0) {
  const initialBalance = Number(user.initialBalance) || 200;
  const dailyRate = Number(user.dailyGrowthRate) !== undefined ? Number(user.dailyGrowthRate) : 50;
  const manualAdjustment = Number(user.manualAdjustment) || 0;
  const growthStartDate = user.growthStartDate ? new Date(user.growthStartDate) : new Date(user.createdAt);

  const now = new Date();
  
  // Normalize to UTC midnight YYYY-MM-DD to avoid time zone shifts
  const startYear = growthStartDate.getUTCFullYear();
  const startMonth = growthStartDate.getUTCMonth();
  const startDateNum = growthStartDate.getUTCDate();
  
  const nowYear = now.getUTCFullYear();
  const nowMonth = now.getUTCMonth();
  const nowDateNum = now.getUTCDate();

  let currentDate = new Date(Date.UTC(startYear, startMonth, startDateNum));
  const targetDate = new Date(Date.UTC(nowYear, nowMonth, nowDateNum));

  let weekdaysElapsed = 0;
  let runningBalance = initialBalance;
  const history = [];

  // Record day 0 (Initial deposit/start date)
  history.push({
    date: currentDate.toISOString().split('T')[0],
    dayOfWeek: getDayName(currentDate.getUTCDay()),
    isWeekend: isWeekend(currentDate.getUTCDay()),
    growthAmount: 0,
    balance: runningBalance,
    note: 'Initial Account Deposit'
  });

  // Step through each day up to today
  while (currentDate < targetDate) {
    currentDate.setUTCDate(currentDate.getUTCDate() + 1);
    const dayOfWeek = currentDate.getUTCDay();
    const isWknd = isWeekend(dayOfWeek);
    
    let added = 0;
    if (!isWknd && user.status === 'ACTIVE') {
      added = dailyRate;
      weekdaysElapsed++;
      runningBalance += added;
    }

    history.push({
      date: currentDate.toISOString().split('T')[0],
      dayOfWeek: getDayName(dayOfWeek),
      isWeekend: isWknd,
      growthAmount: added,
      balance: runningBalance,
      note: isWknd ? 'Market Paused (Weekend)' : `Algorithmic Yield (+$${added})`
    });
  }

  const calculatedGrowth = weekdaysElapsed * dailyRate;
  const currentTotal = initialBalance + calculatedGrowth + manualAdjustment - approvedWithdrawalsTotal;

  const currentDayOfWeek = now.getUTCDay();
  const currentIsWeekend = isWeekend(currentDayOfWeek);

  return {
    initialBalance,
    currentBalance: Math.max(0, Math.round(currentTotal * 100) / 100),
    dailyGrowthRate: dailyRate,
    weekdaysElapsed,
    calculatedGrowth,
    manualAdjustment,
    approvedWithdrawalsTotal,
    todayProfit: currentIsWeekend || user.status !== 'ACTIVE' ? 0 : dailyRate,
    isWeekend: currentIsWeekend,
    growthStatus: user.status !== 'ACTIVE' ? 'PAUSED' : currentIsWeekend ? 'WEEKEND_PAUSED' : 'ACTIVE_GROWING',
    history: history.reverse() // Most recent first
  };
}

function isWeekend(dayIndex) {
  return dayIndex === 0 || dayIndex === 6; // 0 = Sunday, 6 = Saturday
}

function getDayName(dayIndex) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayIndex];
}
