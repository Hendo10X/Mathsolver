<script context="module">
    // @ts-nocheck
    // @ts-ignore
    export async function load({ fetch }) {
  try {
    const res = await fetch(`https://api.themoviedb.org/3/movie/popular?api_key=45ca09f6eccf1ca4dd487583891354fa&language=en-US&page=1`);
    const data = await res.json();

    console.log('Fetched Data:', data); // Logs on the server-side console.

    if (res.ok) {
      return {
        props: { popular: data }
      };
    } else {
      console.error('API Error:', res.statusText);
      return { props: { popular: null } };
    }
  } catch (error) {
    console.error('Fetch Error:', error);
    return { props: { popular: null } };
  }
}

</script>

<script>

</script>
