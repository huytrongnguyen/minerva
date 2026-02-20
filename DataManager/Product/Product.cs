using DataManager.Shared;

namespace DataManager.Product;

public record ProductInfo(
  string ProductId,
  DateOnly StartDate,
  string? ProductName,
  string? DataOwner,
  string? DataProducer,
  string? SqlDialect,
  DateTime CreatedAt,
  DateTime? UpdatedAt
);
public record ProductInfoPatchRequest(
  string? ProductName,
  string? DataOwner,
  string? DataProducer,
  string? SqlDialect,
  string? Endpoint,
  string? ClientId,
  string? ClientSecret
);
public record ProductSettings(List<DataConnection> Connections, List<EventMapping> EventMappings);

public record EventMapping(string EventMappingId, string TableName, string EventName);
