using System.Net.Http.Headers;
using System.Text.Json.Serialization;
using DataManager.Shared;

namespace DataManager.Infrastructure;

public class TrinoStore(ILogger<TrinoStore> logger) : ITrinoStore {
  public async Task<List<TrackedDataSet>> ListDataSets(DataConnection connection) {
    var result = new List<TrackedDataSet>();

    var catalogs = await ExecuteQueryAsync(connection, "show catalogs");
    foreach (var catalog in catalogs) {
      var catalogName = catalog["Catalog"].ToString();
      var schemas = await ExecuteQueryAsync(connection, $"show schemas from {catalogName}");
      if (schemas.Count <= 0) continue;

      foreach(var schema in schemas) {
        var schemaName = schema["Schema"].ToString();
        var tables = await ExecuteQueryAsync(connection, $"show tables from {catalogName}.{schemaName}");
        if (tables.Count <= 0) continue;

        result.Add(new TrackedDataSet(
          Name: $"{catalogName}.{schemaName}",
          Tables: [..tables.Select(x => $"{catalogName}.{schemaName}.{x["Table"]}")]
        ));
      }
    }

    return result;
  }

  public async Task<TrackedDataSet> GetDataSet(string dataSetName, DataConnection connection) {
    var tables = await ExecuteQueryAsync(connection, $"show tables from {dataSetName}");
    return new TrackedDataSet(
      Name: $"{dataSetName}",
      Tables: [..tables.Select(x => $"{dataSetName}.{x["Table"]}")]
    );
  }

  public async Task<List<TrackedDataColumn>> ListDataColumns(string tableName, DataConnection connection) {
    var columns = await ExecuteQueryAsync(connection, $"show columns from {tableName}");
    logger.Console($"tableName = {tableName}, columns = {ObjectUtils.Encode(columns)}");
    return [..columns.Select(x => new TrackedDataColumn(Name: $"{x["Column"]}", Type: $"{x["Type"]}", Desc: $"{x["Comment"]}"))];
  }

  public async Task<List<Dictionary<string, object>>> ExecuteQueryAsync(DataConnection connection, string sql) {
    var httpClient = new HttpClient();

    // Auth: Basic (most common for Trino LDAP/Password)
    var byteArray = System.Text.Encoding.ASCII.GetBytes($"{connection.ClientId}:{connection.ClientSecret}");
    httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue(
        "Basic", Convert.ToBase64String(byteArray));

    // Step 1: Submit query (POST /v1/statement)
    var requestContent = new StringContent(sql, System.Text.Encoding.UTF8, "text/plain");
    var responseMessage = await httpClient.PostAsync($"{connection.Endpoint.TrimEnd('/')}/v1/statement", requestContent);
    var responseText = await responseMessage.Content.ReadAsStringAsync();
    var response = ObjectUtils.Decode<TrinoQueryResponse>(responseText);

    var nextUri = response.NextUri;

    var columns = new List<string>();
    var result = new List<Dictionary<string, object>>();

    while (!string.IsNullOrWhiteSpace(nextUri)) {
      responseMessage = await httpClient.GetAsync(nextUri);
      responseText = await responseMessage.Content.ReadAsStringAsync();
      response = ObjectUtils.Decode<TrinoQueryResponse>(responseText);

      if (response.Error != null) {
        logger.Warning(response.Error.Message);
      }

      if (response?.Columns?.Count > 0 && columns.Count == 0) {
        response?.Columns?.ForEach(col => columns.Add(col.Name));
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

    return result;
  }
}

public record TrinoQueryResponse(
  [property:JsonPropertyName("id")] string Id,
  [property:JsonPropertyName("infoUri")] string InfoUri,
  [property:JsonPropertyName("nextUri")] string NextUri,
  [property:JsonPropertyName("columns")] List<TrinoColumn> Columns,
  [property:JsonPropertyName("data")] List<List<object>> Data,
  [property:JsonPropertyName("error")] TrinoError Error,
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

public record TrinoError([property:JsonPropertyName("message")] string Message);

