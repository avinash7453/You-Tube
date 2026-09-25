import { useState } from "react";

const categories = [
  "ALL",
  "MUSIC",
  "GAMING",
  "NEWS",
  "MOVIES",
  "SPORTS",
  "TECHNOLOGY",
  "COMEDY",
  "EDUCATION",
  "SCIENCE",
  "TRAVEL",
  "FOOD",
  "FASHION",
];

const CategoryTabs = () => {
  const [activeCategory, setActiveCategory] = useState("ALL");

  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {categories.map((category) => {
        const isActive = activeCategory === category;

        return (
          <button
            key={category}
            type="button"
            className={`shrink-0 rounded-md px-3 py-1.5 text-xs font-medium transition ${
              isActive
                ? "bg-black text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            onClick={() => setActiveCategory(category)}
          >
            {category.charAt(0) + category.slice(1).toLowerCase()}
          </button>
        );
      })}
    </div>
  );
};

export default CategoryTabs;