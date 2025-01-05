import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Assignment from "../models/Assignment";
import Site from "../models/Site";
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

  const getCurrentSemester = (): string => {
    const now = new Date();

    // 年を年度に直す
    const year =
      now.getMonth() <= 2 ? now.getFullYear() - 1 : now.getFullYear();
    const semester =
      3 <= now.getMonth() && now.getMonth() <= 7 ? "前期" : "後期";
    const current = `${year}${semester}`;

    return current;
  };

  const fetchAndSaveSites = useCallback(async (user: User): Promise<Site[]> => {
    const current = getCurrentSemester();
    const siteList = await PandaUtils.getAllSites(user, current);

    await AsyncStorage.setItem("sites", JSON.stringify({ siteList, current }));

    return siteList;
  }, []);

  const loadSites = useCallback(
    async (user: User, refresh: boolean = false): Promise<Site[]> => {
      const storedSitesData = await AsyncStorage.getItem("sites");

      let siteList: Site[] = [];

      if (storedSitesData && !refresh) {
        const parsedData = JSON.parse(storedSitesData);
        siteList = parsedData.siteList;
        const current = parsedData.current;
        if (current !== getCurrentSemester()) {
          loadSites(user, true);
        }
      } else {
        siteList = await fetchAndSaveSites(user);
      }

      return siteList;
    },
    [fetchAndSaveSites],
  );

  const fetchAndSaveAssignments = useCallback(
    async (user: User): Promise<Assignment[]> => {
      const siteList = await loadSites(user);

      const assignmentList: Assignment[] = await Promise.all(
        siteList.map(async (site) => {
          return await PandaUtils.getAssignmentsBySite(user, site);
        }),
      ).then((results) => results.flat());

      const timestamp = new Date().toISOString();
      await AsyncStorage.setItem(
        "assignments",
        JSON.stringify({ assignmentList, timestamp }),
      );

      return assignmentList;
    },
    [loadSites],
  );

  const loadAssignments = useCallback(
    async (user: User, refresh: boolean = false) => {
      let assignmentList: Assignment[] = [];
      let timestamp: string = "";

      const storedAssignmentsData = await AsyncStorage.getItem("assignments");
      if (storedAssignmentsData && !refresh) {
        const parsedData = JSON.parse(storedAssignmentsData);
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
          return assignment.dueTime > new Date().getTime();
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
