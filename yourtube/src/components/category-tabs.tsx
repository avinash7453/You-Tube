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
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => {
        const isActive = activeCategory === category;

        return (
          <button
            key={category}
            type="button"
            className={`rounded-full px-3 py-2 text-sm font-medium transition ${
              isActive
                ? "bg-black text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </button>
        );
      })}
    </div>
  );
};

export default CategoryTabs;