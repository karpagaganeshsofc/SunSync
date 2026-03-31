export async function fetchSunRisePhoto(city:string): Promise< string | null> {
    try{
        const key = process.env.EXPO_PUBLIC_UNSPLASH_KEY;
        if (!key) return null;
        const query = await fetch(`https://api.unsplash.com/photos/random?query=sunrise+${city}&client_id=${key}`);
        const data =await query.json();

        return data.urls.regular;
    }
    catch(e){
        return null;
    }
}