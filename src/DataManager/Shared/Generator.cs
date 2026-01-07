namespace DataManager.Shared;

public class SnowflakeIdGen {
  public SnowflakeIdGen(long workerId) {
    if (workerId < 0 || MaxWorkerId < workerId) throw new ArgumentException($"Worker ID must be between 0 and {MaxWorkerId}");
    this.workerId = workerId;
  }

  public long NextId() {
    using (_lock.EnterScope()) {
      long timestamp = TimeUtils.GetTime();

      if (timestamp < lastTimestamp) throw new InvalidOperationException($"Clock moved backwards. Refusing to generate ID for {lastTimestamp - timestamp} milliseconds.");

      if (timestamp == lastTimestamp) {
        sequence = (sequence + 1) & MaxSequence;
        if (sequence == 0) timestamp = WaitNextMillis(timestamp); // Sequence overflow in this millisecond; wait for next ms
      } else {
        sequence = 0;
      }

      lastTimestamp = timestamp;

      return (timestamp << TimestampShift) | (workerId << WorkerIdShift) | sequence;
    }
  }

  private static long CurrentTimestamp() => TimeUtils.GetTime() - Epoch;

  private static long WaitNextMillis(long currentTimestamp) {
    long timestamp = CurrentTimestamp();
    while (timestamp <= currentTimestamp) {
      Thread.Sleep(1); // Small sleep to wait for clock tick
      timestamp = CurrentTimestamp();
    }
    return timestamp;
  }

  private const long Epoch = 1288834974657L; // Twitter's Snowflake epoch: 2010-11-04 01:42:54.657 UTC
  private const int WorkerIdBits = 10;
  private const int SequenceBits = 12;
  private const long MaxWorkerId = -1L ^ (-1L << WorkerIdBits); // 1023
  private const long MaxSequence = -1L ^ (-1L << SequenceBits); // 4095
  private const int WorkerIdShift = SequenceBits;
    private const int TimestampShift = SequenceBits + WorkerIdBits;

  private readonly long workerId;
  private long lastTimestamp = -1L;
  private long sequence = 0L;
  private readonly Lock _lock = new();
}