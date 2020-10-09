exports.getCachedSearchResult = async ({ client, keyword, domain }) => {
    const collection = client.db("Muah_bio").collection("cachedProductSearches");

    const results = await collection.find( { keyword, domain } ).toArray();

    if ( results.length > 0 ) {
        return results[0]
    }

    return {error: "Result not cached"}

}