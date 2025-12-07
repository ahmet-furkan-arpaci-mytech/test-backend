import { SourceModel } from "../models/source.model";

type DocWithSource = {
  sourceId?: string;
  sourceProfilePictureUrl?: string | null;
  sourceTitle?: string | null;
  sourceName?: string | null;
};

/**
 * Enriches news-like documents with source metadata (name/title and profile picture) by
 * looking up the related Source documents once.
 */
export async function attachSourceMetadata<T extends DocWithSource>(
  docs: T[]
): Promise<T[]> {
  const sourceIds = Array.from(
    new Set(
      docs
        .map((doc) => doc.sourceId)
        .filter((id): id is string => typeof id === "string" && id.trim() !== "")
    )
  );

  if (sourceIds.length === 0) {
    return docs;
  }

  const sources = await SourceModel.find({ _id: { $in: sourceIds } })
    .select({ _id: 1, name: 1, imageUrl: 1 })
    .lean();
  const sourceMap = new Map<
    string,
    { _id: string; name?: string | null; imageUrl?: string | null }
  >();
  sources.forEach((source) => {
    if (source?._id) {
      sourceMap.set(source._id, source);
    }
  });

  return docs.map((doc) => {
    const match = doc.sourceId ? sourceMap.get(doc.sourceId) : undefined;
    if (!match) {
      return doc;
    }

    return {
      ...doc,
      sourceProfilePictureUrl:
        doc.sourceProfilePictureUrl ?? match.imageUrl,
      sourceTitle: doc.sourceTitle ?? match.name,
      sourceName: doc.sourceName ?? match.name,
    };
  });
}
