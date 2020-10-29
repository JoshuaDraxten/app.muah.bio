export default async username => {
    const ig_json = await fetch(`https://www.instagram.com/${username}/?__a=1`).then(res => res.json());

    return ig_json.graphql.user.edge_owner_to_timeline_media.edges.map(({node}) => ({
        id: node.id,
        media_url: node.display_url,
        timestamp: new Date(node.taken_at_timestamp * 1000)
    }));
}