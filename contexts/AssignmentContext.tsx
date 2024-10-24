import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Assignment from "../models/Assignment";
import User from "../models/User";
import PandaUtils from "../utils/PandaUtils";

type AssignmentContextType = {
  assignments: Assignment[];
  setAssignments: React.Dispatch<React.SetStateAction<Assignment[]>>;
  loadAssignments: (user: User, refresh: boolean) => Promise<void>;
  lastRefresh: Date | null;
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
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const fetchAndSaveAssignments = useCallback(
    async (user: User): Promise<Assignment[]> => {
      const assignmentList = await PandaUtils.getAllAssignments(user);
      const timestamp = new Date().toISOString();

      await AsyncStorage.setItem(
        "assignments",
        JSON.stringify({ assignmentList, timestamp }),
      );

      return assignmentList;
    },
    [],
  );

  const loadAssignments = useCallback(
    async (user: User, refresh: boolean = false) => {
      let assignmentList: Assignment[] = [];
      let timestamp: string = "";

      const storedData = await AsyncStorage.getItem("assignments");
      if (storedData && !refresh) {
        const parsedData = JSON.parse(storedData);
        assignmentList = parsedData.assignmentList;
        timestamp = parsedData.timestamp;
      } else {
        assignmentList = await fetchAndSaveAssignments(user);
        timestamp = new Date().toISOString();
      }

      const formattedAssignmentList = assignmentList
        .sort((a, b) => {
          const dateA = new Date(a.dueTime);
          const dateB = new Date(b.dueTime);
          return dateA.getTime() - dateB.getTime();
        })
        .filter((assignment: Assignment) => {
          return assignment.dueTime > new Date();
        });

      setAssignments(formattedAssignmentList);
      setLastRefresh(new Date(timestamp));
    },
    [fetchAndSaveAssignments],
  );

  return (
    <AssignmentContext.Provider
      value={{
        assignments,
        setAssignments,
        loadAssignments,
        lastRefresh,
      }}
    >
      {children}
    </AssignmentContext.Provider>
  );
};
