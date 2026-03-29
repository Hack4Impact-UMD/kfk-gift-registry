import { Button } from "@/components/ui/button";
import {
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
} from "@/components/icons";

const getPaginationRange = (
  pages: Array<number>,
  currentPage: number,
  totalPages: number,
  maxButtons: number,
  immediatePages: number,
) => {
  let range = [];

  if (pages.length <= maxButtons) range = pages;
  else if (currentPage <= immediatePages)
    range = [...pages.slice(0, immediatePages + 3), -1, totalPages]; // -1 represents the ellipsis
  else if (currentPage > totalPages - immediatePages)
    range = [
      1,
      -1,
      ...pages.slice(totalPages - immediatePages - 3, totalPages),
    ];
  else
    range = [
      1,
      -1,
      ...pages.slice(
        currentPage - 1 - immediatePages / 2,
        currentPage + immediatePages / 2,
      ),
      -1,
      totalPages,
    ];

  return range;
};

// Pagination
interface PaginationProp {
  totalChildren: number;
  childrenPerPage: number;
  setCurrentPage: (page: number) => any;
  currentPage: number;
  MAX_BUTTONS: number;
  IMMEDIATE_PAGES: number;
}
export const Pagination = ({
  totalChildren,
  childrenPerPage,
  setCurrentPage,
  currentPage,
  MAX_BUTTONS,
  IMMEDIATE_PAGES,
}: PaginationProp) => {
  const totalPages = Math.ceil(totalChildren / childrenPerPage);
  const boundedCurrentPage = Math.min(Math.max(currentPage, 1), Math.max(totalPages, 1));
  const pages = [];

  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  const range = getPaginationRange(
    pages,
    currentPage,
    totalPages,
    MAX_BUTTONS,
    IMMEDIATE_PAGES,
  );

  return (
    <div className="mx-auto mt-10 flex justify-center gap-2 text-xl">
      <Button
        onClick={() => setCurrentPage(Math.max(1, boundedCurrentPage - 1))}
        type="button"
        variant="ghost"
        disabled={boundedCurrentPage <= 1 || totalChildren <= 0}
        className={`rounded-full pl-2 w-10 h-10 ${currentPage == 1 || totalChildren <= 0 ? "text-gray-400" : "text-primary hover:bg-gray-100"} bg-transparent transition-all text-xl`}
      >
        <ChevronDoubleLeftIcon className="size-5" />
      </Button>
      {range.map((page, index) => {
        return (
          <Button
            key={page === -1 ? `ellipsis-${index}` : `page-${page}`}
            onClick={() => setCurrentPage(page)}
            disabled={page == -1}
            className={`rounded-full text-primary w-10 h-10 ${page != -1 ? (page == currentPage ? "bg-kfk-blue text-white" : "bg-transparent hover:bg-gray-100") : "bg-transparent"} transition-all text-xl`}
          >
            {page == -1 ? "..." : page}
          </Button>
        );
      })}
      <Button
        onClick={() => setCurrentPage(Math.min(Math.max(totalPages, 1), boundedCurrentPage + 1))}
        type="button"
        variant="ghost"
        disabled={boundedCurrentPage >= totalPages || totalChildren <= 0}
        className={`rounded-full pl-3 w-10 h-10 ${currentPage == totalPages || totalChildren <= 0 ? "text-gray-400" : "text-primary hover:bg-gray-100"} bg-transparent transition-all text-xl`}
      >
        <ChevronDoubleRightIcon className="size-5" />
      </Button>
    </div>
  );
};
