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

public record ProductEvent(
  string ProductId,
  string EventName,
  string EventDisplayName,
  string EventSemanticName
);

public record TrackedEvent(string EventName, string SemanticName);

public record ProductEventField(
  string ProductId,
  string EventName,
  string FieldName,
  string FieldDisplayName,
  string FieldSemanticName
);