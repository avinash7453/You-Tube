import React, { Suspense } from "react";
import { useRouter } from "next/router";
import SearchResult from "@/components/SearchResult";

const SearchPage = () => {
    const router = useRouter();
    const q = router.query.q as string;

    return (
        <div className="mx-auto max-w-7xl px-4 py-6">
            <div>
                {q && (
                    <div className="mb-4"> 
                        <h1 className="text-xl font-bold">Search results for "{q}"</h1>
                    </div>
                )}
                <Suspense fallback={<div className="text-center py-10">Loading...</div>}>
                    <SearchResult query={q || ""} />
                </Suspense>
            </div>
        </div>
    );
};

export default SearchPage;