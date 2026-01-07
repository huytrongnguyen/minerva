namespace DataManager.Shared;

/// <summary>
/// A couple of convenience functions to access the library's global uniform stream
/// </summary>
public static partial class Imc {
  private static readonly UniformRandom uniform = new();

  public static int RandomInt(int minValue, int maxValue) => uniform.RandomInt(minValue, maxValue);
  public static int RandomInt(int maxValue) => uniform.RandomInt(maxValue);
  public static int Rand() => uniform.Rand();
  public static double RandomDouble() => uniform.RandomDouble();

  public static SnowflakeIdGen NewSnowflakeId(long nodeId) => new(nodeId);
}

/// <summary>
/// The standard generator of uniformly distributed random numbers
/// </summary>
internal class UniformRandom {
  private readonly Random srand;

  public UniformRandom() {
    srand = new Random((int)TimeUtils.GetTime()); // Sets the seed of the random number generator
  }

  public UniformRandom(int Seed) {
    srand = new Random(Seed); // Sets the seed of the random number generator
  }

  // Generates random numbers
  public int RandomInt(int minValue, int maxValue) => srand.Next(minValue, maxValue);
  public int RandomInt(int maxValue) => srand.Next(maxValue);
  public int Rand() => srand.Next();
  public double RandomDouble() => srand.NextDouble();
}
