import vision from "@google-cloud/vision";

type VisionClient = InstanceType<typeof vision.ImageAnnotatorClient>;

let client: VisionClient | null = null;

function getClient(): VisionClient | null {
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS && !process.env.GOOGLE_CLOUD_PROJECT) {
    return null;
  }
  if (!client) {
    client = new vision.ImageAnnotatorClient();
  }
  return client;
}

export async function extractLabels(imageBytes: Buffer): Promise<string[]> {
  const apiClient = getClient();
  if (!apiClient) {
    return [];
  }

  try {
    const [result] = await apiClient.labelDetection({
      image: { content: imageBytes.toString("base64") },
    });
    return (result.labelAnnotations ?? [])
      .map((label) => label.description?.toLowerCase().trim())
      .filter((label): label is string => Boolean(label))
      .slice(0, 8);
  } catch {
    return [];
  }
}
