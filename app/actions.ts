"use server";

export async function fetchYoutubeMetadata(url: string) {
  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
    const response = await fetch(oembedUrl);
    if (!response.ok) {
      return { error: "Impossible de récupérer les informations de la vidéo." };
    }
    const data = await response.json();
    
    // Extract video ID from URL
    const videoIdMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})/);
    const id = videoIdMatch ? videoIdMatch[1] : null;

    if (!id) {
      return { error: "URL YouTube invalide." };
    }

    return {
      track: {
        id,
        title: data.title,
        author: data.author_name,
        thumbnail: `https://img.youtube.com/vi/${id}/0.jpg`, // the oEmbed thumbnail can be cropped, this one is better for 1:1 or high res
        url
      }
    };
  } catch (err: any) {
    return { error: err.message || "Erreur réseau." };
  }
}
