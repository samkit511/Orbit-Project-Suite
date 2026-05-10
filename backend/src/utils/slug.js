export function slugify(value) {
  return value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "project";
}

export async function createUniqueProjectSlug(prisma, name) {
  const base = slugify(name);
  let slug = base;
  let counter = 2;

  while (await prisma.project.findUnique({ where: { slug } })) {
    slug = `${base}-${counter}`;
    counter += 1;
  }

  return slug;
}
