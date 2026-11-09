/**
 * Trading Trends Wallet Engine
 * Handles automated calculation of 3% daily compounding growth from Monday to Friday.
 * Freezes growth on Saturdays and Sundays.
 */

export function calculateUserWallet(user, approvedWithdrawalsTotal = 0) {
  const initialBalance = Number(user.initialBalance) || 200;
  const dailyRate = Number(user.dailyGrowthRate) !== undefined ? Number(user.dailyGrowthRate) : 3;
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
  let todayAdded = 0;
  const history = [];

  // Record day 0 (Initial deposit/start date)
  history.push({
    date: currentDate.toISOString().split('T')[0],
    dayOfWeek: getDayName(currentDate.getUTCDay()),
    isWeekend: isWeekend(currentDate.getUTCDay()),
    growthAmount: 0,
    balance: Math.round(runningBalance * 100) / 100,
    note: 'Initial Account Deposit'
  });

  // Step through each day up to today
  while (currentDate < targetDate) {
    currentDate.setUTCDate(currentDate.getUTCDate() + 1);
    const dayOfWeek = currentDate.getUTCDay();
    const isWknd = isWeekend(dayOfWeek);
    
    let added = 0;
    if (!isWknd && user.status === 'ACTIVE') {
      added = Math.round(runningBalance * (dailyRate / 100) * 100) / 100;
      weekdaysElapsed++;
      runningBalance += added;
      runningBalance = Math.round(runningBalance * 100) / 100;
      todayAdded = added;
    }

    history.push({
      date: currentDate.toISOString().split('T')[0],
      dayOfWeek: getDayName(dayOfWeek),
      isWeekend: isWknd,
      growthAmount: added,
      balance: Math.round(runningBalance * 100) / 100,
      note: isWknd ? 'Market Paused (Weekend)' : `Algorithmic Yield (+${dailyRate}% / +$${added.toFixed(2)})`
    });
  }

  const calculatedGrowth = Math.max(0, Math.round((runningBalance - initialBalance) * 100) / 100);
  const currentTotal = runningBalance + manualAdjustment - approvedWithdrawalsTotal;

  const currentDayOfWeek = now.getUTCDay();
  const currentIsWeekend = isWeekend(currentDayOfWeek);
  const projectedTodayProfit = Math.round(runningBalance * (dailyRate / 100) * 100) / 100;

  return {
    initialBalance,
    currentBalance: Math.max(0, Math.round(currentTotal * 100) / 100),
    dailyGrowthRate: dailyRate,
    weekdaysElapsed,
    calculatedGrowth,
    manualAdjustment,
    approvedWithdrawalsTotal,
    todayProfit: currentIsWeekend || user.status !== 'ACTIVE' ? 0 : (todayAdded || projectedTodayProfit),
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
