import { useMemo } from "react";
import { IBankAccount, IIRAPortfolioItem } from "../types";

interface UseDropdownDataProps {
  bankLists: IBankAccount[];
}

export const useDropdownData = ({ bankLists }: UseDropdownDataProps) => {
  const dropdownLists: IIRAPortfolioItem[] = useMemo(() => {
    return bankLists
      ?.filter((bank: IBankAccount) => 
        bank?.account_type?.toLowerCase().includes("ira")
      )
      .map((bank: IBankAccount, index: number) => ({
        id: index,
        label: `${bank.account_type} portfilo`,
        value: `${bank.account_type} portfilo`,
      })) || [];
  }, [bankLists]);

  return { dropdownLists };
};
