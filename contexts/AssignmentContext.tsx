import React, { createContext, useContext, useState, ReactNode } from "react";
import Assignment from "../models/Assignment";

type AssignmentContextType = {
  assignments: Assignment[];
  setAssignments: React.Dispatch<React.SetStateAction<Assignment[]>>;
};

const AssignmentContext = createContext<AssignmentContextType | undefined>(
  undefined,
);

export const useAssignments = () => {
  const context = useContext(AssignmentContext);
  if (context === undefined) {
    throw new Error("useAssignments must be used within an AssignmentProvider");
  }
  return context;
};

export const AssignmentProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  return (
    <AssignmentContext.Provider value={{ assignments, setAssignments }}>
      {children}
    </AssignmentContext.Provider>
  );
};
