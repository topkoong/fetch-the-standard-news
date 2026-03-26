import fetchCategories from '@apis/categories';
import { useMemo } from 'preact/hooks';
import { useQuery } from 'react-query';
import type { WpCategory } from 'types/wp-api';

interface NavCategory {
  id: number;
  label: string;
}

const PRIORITY_CATEGORY_IDS = [39, 11, 12, 13, 14, 26, 27, 33, 58822, 32, 34, 31];
const ASCII_NAME = /^[A-Za-z0-9\s&|/-]+$/;
const FALLBACK_NAV_LABELS: Record<number, string> = {
  39: 'News',
  11: 'World',
  12: 'Thailand',
  13: 'Business',
  14: 'Sport',
  26: 'Film',
  27: 'Music',
  33: 'Travel',
  58822: 'Economic',
  32: 'Eat & Drink',
  34: 'Art & Design',
  31: 'Health',
};

function decodeHtmlEntities(text: string): string {
  return text.replaceAll('&amp;', '&').replaceAll('&#8217;', "'");
}

export function useCategoryData() {
  const { data: categoriesData } = useQuery('allcategories', fetchCategories);

  const nonThaiCategoryIdToName = useMemo(() => {
    const map: Record<string, string> = {};
    for (const row of categoriesData ?? []) {
      if (ASCII_NAME.test(row.name)) {
        map[String(row.id)] = decodeHtmlEntities(row.name);
      }
    }
    return map;
  }, [categoriesData]);

  const navCategories = useMemo((): NavCategory[] => {
    if (!categoriesData?.length) {
      return PRIORITY_CATEGORY_IDS.map((id) => ({
        id,
        label: FALLBACK_NAV_LABELS[id] ?? String(id),
      }));
    }

    const byId = new Map<number, WpCategory>(categoriesData.map((row) => [row.id, row]));
    const selected: NavCategory[] = [];
    const seen = new Set<number>();
    const seenLabel = new Set<string>();

    for (const id of PRIORITY_CATEGORY_IDS) {
      const category = byId.get(id);
      if (!category?.name) continue;
      const label = decodeHtmlEntities(category.name);
      if (seenLabel.has(label)) continue;
      selected.push({ id: category.id, label });
      seen.add(category.id);
      seenLabel.add(label);
    }

    const ranked = categoriesData
      .filter(
        (row) =>
          !seen.has(row.id) &&
          (row.count ?? 0) > 0 &&
          Boolean(row.name) &&
          ASCII_NAME.test(row.name),
      )
      .sort((a, b) => (b.count ?? 0) - (a.count ?? 0))
      .slice(0, 8)
      .map((row) => ({ id: row.id, label: decodeHtmlEntities(row.name) }))
      .filter((row) => {
        if (seenLabel.has(row.label)) return false;
        seenLabel.add(row.label);
        return true;
      });

    return [...selected, ...ranked];
  }, [categoriesData]);

  return { categoriesData, nonThaiCategoryIdToName, navCategories };
}
