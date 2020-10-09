exports.addCachedSearchResult =  async ({ client, keyword, results, domain }) => {
    const collection = client.db("Muah_bio").collection("cachedProductSearches");

    return collection.insertOne({ keyword, results, domain })
        .catch( err => ({
            statusCode: 500,
            body: JSON.stringify(err)
        }))
        .then( response => ({
            statusCode: 200,
            body: JSON.stringify(response)
        }));

}