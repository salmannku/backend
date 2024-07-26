class FrequencyDistribution {
  // A simple classless (1 class width)
  // ordered frequency distribution.

  private dist: Array<[number, number]>
  private distSize: number
  private _mean: number
  private freqTotal: number

  constructor() {
    this.dist = []
    this.distSize = 0
    this.freqTotal = 0
    this._mean = 0
  }

  private search(n: number): [number, true | false] {
    // Performs binary search over the distribution.
    //
    // Will always return the expected position of the
    // search value, along with the search result.

    let leftBound = 0
    let rightBound = this.distSize - 1
    let middle = Math.floor(this.distSize / 2)

    while (leftBound <= rightBound && this.dist[middle] !== undefined) {
      if (this.dist[middle][0] === n)
        return [middle, true]
      if (this.dist[middle][0] < n)
        leftBound = middle + 1
      else
        rightBound = middle - 1
      middle = Math.floor((rightBound + leftBound) / 2)
    }

    return [middle, false]
  }

  public get mean(): number {
    // returns the mean of the frequency distribution
    return this._mean
  }

  public addCount(n: number, frequency: number = 1) {
    // Counts a value.
    let [index, result] = this.search(n)

    if (result)
      this.dist[index][1] += frequency
    else {
      this.distSize++
      this.dist.splice(index + 1, 0, [n, frequency])
    }

    this._mean = (this._mean * this.freqTotal + n * frequency) / (this.freqTotal + frequency)
    this.freqTotal += frequency
  }

  public getCount(n: number): number {
    // Gets the frequency of a value.

    let [index, result] = this.search(n)

    if (result)
      return this.dist[index][1]
    return 0
  }

  public getPosition(n: number): number {
    // Returns the relative position of a value on the
    // frequency distribution, from 0-1.
    //
    // The frequency distribution is sorted smallest to largest,
    // and the position index specifies where a value relatively
    // lies on this distribution.

    let index = 0
    let cumFreq = 0

    while (index < this.dist.length && this.dist[index][0] < n) {
      cumFreq += this.dist[index][1]
      index++
    }

    if (this.dist[index][0] === n)
      cumFreq += this.dist[index][1] / 2

    return cumFreq / this.freqTotal
  }

  public clear(): void {
    // Clears all data in the frequency distribution.
    this.dist = []
    this.distSize = 0
  }
}

export default FrequencyDistribution

