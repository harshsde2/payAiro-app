//FIX ME: This need to be deleted once API is updated
export function generateRandomPercentages(n: number, minPercentage: number = 10): number[] {
  if (n <= 0) return [];
  if (n === 1) return [100];

  const totalMinimum = n * minPercentage;
  if (totalMinimum > 100) {
    throw new Error(`Cannot create ${n} segments with minimum ${minPercentage}% each`);
  }

  const percentages = new Array(n).fill(minPercentage);

  const remainingPercentage = 100 - totalMinimum;

  if (remainingPercentage > 0) {
    const randomPoints: number[] = [];
    for (let i = 0; i < n - 1; i++) {
      randomPoints.push(Math.random());
    }

    randomPoints.push(0, 1);

    randomPoints.sort((a, b) => a - b);

    for (let i = 1; i < randomPoints.length; i++) {
      const diff = (randomPoints[i] - randomPoints[i - 1]) * remainingPercentage;
      percentages[i - 1] += diff;
      percentages[i - 1] = parseFloat(percentages[i - 1].toFixed(2));
    }
  }

  const sum = percentages.reduce((acc, val) => acc + val, 0);
  if (Math.abs(sum - 100) > 0.01) {
    percentages[percentages.length - 1] += 100 - sum;
    percentages[percentages.length - 1] = parseFloat(percentages[percentages.length - 1].toFixed(2));
  }

  return percentages;
}
