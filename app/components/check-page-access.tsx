import React, { ReactNode, useEffect, useState } from "react";

import { PermissionManager } from "@utils/permissionManager";

interface CheckPageAccessProps {
  pageName: string;
  children: ReactNode;
}

function CheckPageAccess({ pageName, children }: CheckPageAccessProps) {
  const [hasPageAccess, setHasPageAccess] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    const checkPageAccess = async () => {
      const permissionMan = new PermissionManager();
      await permissionMan.init();

      // Check if the user has access to the page
      const accessGranted = permissionMan.hasPageAccess(pageName);
      if (!isCancelled) setHasPageAccess(accessGranted);
    };

    checkPageAccess();

    return () => {
      isCancelled = true;
    };
  }, [pageName]);

  return hasPageAccess ? <>{children}</> : null;
}

export default CheckPageAccess;
