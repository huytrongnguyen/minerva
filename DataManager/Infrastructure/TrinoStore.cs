using System.Net.Http.Headers;
using System.Text.Json.Serialization;
using DataManager.Shared;

namespace DataManager.Infrastructure;

public class TrinoStore(ILogger<TrinoStore> logger) : ITrinoStore {
  public Task<object> TestConnection(DataConnection connection) {
    return ExecuteQueryAsync(connection, "show catalogs");
  }

  public async Task<object> ExecuteQueryAsync(DataConnection connection, string sql) {
    var httpClient = new HttpClient();

    // Auth: Basic (most common for Trino LDAP/Password)
    var byteArray = System.Text.Encoding.ASCII.GetBytes($"{connection.ClientId}:{connection.ClientSecret}");
    httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue(
        "Basic", Convert.ToBase64String(byteArray));

    // Step 1: Submit query (POST /v1/statement)
    var requestContent = new StringContent(sql, System.Text.Encoding.UTF8, "text/plain");
    var responseMessage = await httpClient.PostAsync($"{connection.Endpoint.TrimEnd('/')}/v1/statement", requestContent);
    var responseText = await responseMessage.Content.ReadAsStringAsync();
    logger.Console($"responseText = {responseText}");
    var response = ObjectUtils.Decode<TrinoQueryResponse>(responseText);
    var nextUri = response.NextUri;

    var columns = new List<string>();
    var result = new List<Dictionary<string, object>>();

    while (!string.IsNullOrEmpty(nextUri)) {
      responseMessage = await httpClient.GetAsync(nextUri);
      responseText = await responseMessage.Content.ReadAsStringAsync();
      logger.Console($"responseText = {responseText}");
      response = ObjectUtils.Decode<TrinoQueryResponse>(responseText);

      if (response?.Columns?.Count > 0 && columns.Count == 0) {
        response?.Columns?.ForEach(col => columns.Add(col.Name));
        logger.Console($"Columns: {ObjectUtils.Encode(columns)}");
      }

      response?.Data?.ForEach(row => {
        var item = new Dictionary<string, object>();
        for (var i = 0; i < row.Count; ++i) {
          if (i < columns.Count) {
            item.Add(columns[i], row[i]);
          }
        }
        result.Add(item);
      });

      nextUri = response.NextUri;
    }
    logger.Console($"Fetch {result.Count} row(s)");

    return result;
  }
}

public record TrinoQueryResponse(
  [property:JsonPropertyName("id")] string Id,
  [property:JsonPropertyName("infoUri")] string InfoUri,
  [property:JsonPropertyName("nextUri")] string NextUri,
  [property:JsonPropertyName("columns")] List<TrinoColumn> Columns,
  [property:JsonPropertyName("data")] List<List<object>> Data,
  [property:JsonPropertyName("stats")] Dictionary<string, object> Stats
);

public record TrinoColumn(
  [property:JsonPropertyName("name")] string Name,
  [property:JsonPropertyName("type")] string Type,
  [property:JsonPropertyName("typeSignature")] TrinoColumn.TrinoTypeSignature TypeSignature
) {
  public record TrinoTypeSignature(
    [property:JsonPropertyName("rawType")] string RawType,
    [property:JsonPropertyName("arguments")] List<Dictionary<string, object>> Arguments
  );
};

