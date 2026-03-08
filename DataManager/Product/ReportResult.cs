namespace DataManager.Product;

// ── Dashboard layout ──────────────────────────────────────────────────────
// Returned by the layout endpoint — no Trino involved, instant response.

public record DashboardLayout(
  string Name,
  List<ReportStub> Reports
);

public record ReportStub(
  string Id,    // slug used in the per-report endpoint URL
  string Name
);

// ── Report result ─────────────────────────────────────────────────────────
// Returned by the per-report endpoint after executing one Trino query.

public record ReportResult(
  string Name,
  List<ColumnInfo> Columns,
  List<List<object>> Data    // columnar: [[field, v1, v2, ...], ...] — maps directly to C3 data.columns
);

// Metadata about a result column — used by the client to label and format values.
public record ColumnInfo(
  string Field,
  string Label
);
