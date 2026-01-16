using System.Text.Json;

namespace DataManager.Shared;

public static class ObjectUtils {
  public static string Encode(this object value, bool pretty = false) => JsonSerializer.Serialize(value, new JsonSerializerOptions { WriteIndented = pretty });
  public static T Decode<T>(this string value) => JsonSerializer.Deserialize<T>(value);
  public static T Transform<T>(this object value) => value.Encode().Decode<T>();
}