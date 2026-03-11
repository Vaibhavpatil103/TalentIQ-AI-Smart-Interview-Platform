import { SearchIcon, FilterIcon } from "lucide-react";

function ProblemFilters({ filters, onFilterChange }) {
  return (
    <div className="flex flex-wrap items-center gap-3 bg-base-100 p-4 rounded-xl shadow-sm border border-base-300">
      {/* Search */}
      <div className="flex-1 min-w-[200px]">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-base-content/40" />
          <input
            type="text"
            placeholder="Search problems..."
            className="input input-bordered w-full pl-10 input-sm"
            value={filters.search || ""}
            onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
          />
        </div>
      </div>

      {/* Difficulty */}
      <select
        className="select select-bordered select-sm"
        value={filters.difficulty || ""}
        onChange={(e) => onFilterChange({ ...filters, difficulty: e.target.value })}
      >
        <option value="">All Difficulties</option>
        <option value="Easy">🟢 Easy</option>
        <option value="Medium">🟡 Medium</option>
        <option value="Hard">🔴 Hard</option>
      </select>

      {/* Tags */}
      <select
        className="select select-bordered select-sm"
        value={filters.tag || ""}
        onChange={(e) => onFilterChange({ ...filters, tag: e.target.value })}
      >
        <option value="">All Tags</option>
        <option value="array">Array</option>
        <option value="string">String</option>
        <option value="hash-table">Hash Table</option>
        <option value="two-pointers">Two Pointers</option>
        <option value="dynamic-programming">Dynamic Programming</option>
      </select>

      {/* Clear filters */}
      {(filters.search || filters.difficulty || filters.tag) && (
        <button
          className="btn btn-ghost btn-sm gap-1"
          onClick={() => onFilterChange({ search: "", difficulty: "", tag: "" })}
        >
          <FilterIcon className="size-3" />
          Clear
        </button>
      )}
    </div>
  );
}

export default ProblemFilters;
