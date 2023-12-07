// Env interface not what I get in runtime
interface Env {
	// Binding to a D1 Database. Learn more at https://developers.cloudflare.com/workers/platform/bindings/#d1-database-bindings
	D1Database: D1Database;
}
