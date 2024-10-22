<script context="module">
    // @ts-nocheck
    // @ts-ignore
    export async function load({ fetch }) {
        const res = await fetch(`https://api.themoviedb.org/3/movie/popular?api_key=45ca09f6eccf1ca4dd487583891354fa&language=en-US&page=1`);
        const data = await res.json()
        console.log(data)
        if (res.ok) {
            return {
                props: {popular: data.results}
            }
        }
    }
</script>

<script>

</script>
