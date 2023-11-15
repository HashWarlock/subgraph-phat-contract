type QueryCollection = { [key: string]: string };

class GraphQLQueryManager {
    private queries: QueryCollection = {};

    public addQuery(name: string, query: string): void {
        if (this.queries[name]) {
            console.warn(`Query with name "${name}" already exists. It will be overwritten.`);
        }
        this.queries[name] = query;
    }

    public addQueries(queriesToAdd: QueryCollection): void {
        for (const [name, query] of Object.entries(queriesToAdd)) {
            this.addQuery(name, query);
        }
    }

    public getQuery(name: string): string | undefined {
        return this.queries[name];
    }

    public getAllQueries(): QueryCollection {
        return this.queries;
    }
}

// Export an instance of the query manager
export const queryManager = new GraphQLQueryManager();
