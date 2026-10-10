import { NextResponse } from "next/server";
import { fetchJobs, fetchCategories } from "../../lib/data";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query")?.toLowerCase().trim() || "";
    const location = searchParams.get("location")?.toLowerCase().trim() || "";
    const category = searchParams.get("category")?.toLowerCase().trim() || "";
    const mode = searchParams.get("mode")?.trim() || "";
    const type = searchParams.get("type")?.trim() || "";

    const [allJobs, categories] = await Promise.all([
      fetchJobs(),
      fetchCategories(),
    ]);

    const filtered = allJobs.filter((job) => {
      const matchText = `${job.title} ${job.company} ${job.category} ${job.skills.join(" ")}`.toLowerCase();
      const matchesQuery = !query || matchText.includes(query);
      const matchesLocation = !location || job.location.toLowerCase().includes(location);
      const matchesCategory =
        !category ||
        job.category.toLowerCase() === category ||
        job.category.toLowerCase().includes(category);
      const matchesMode = !mode || job.workMode.toLowerCase().includes(mode.toLowerCase());
      const matchesType = !type || job.employmentType.toLowerCase().includes(type.toLowerCase());

      return matchesQuery && matchesLocation && matchesCategory && matchesMode && matchesType;
    });

    return NextResponse.json({
      jobs: filtered,
      categories,
      total: filtered.length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch jobs", jobs: [], categories: [], total: 0 },
      { status: 500 }
    );
  }
}
