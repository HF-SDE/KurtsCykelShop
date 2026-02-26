import React, { ReactNode, useEffect, useState } from "react";

import { PermissionManager } from "@utils/permissionManager";

interface CheckPageAccessProps {
  pageName: string;
  children: ReactNode;
}

function CheckPageAccess({ pageName, children }: CheckPageAccessProps) {
  const [hasPageAccess, setHasPageAccess] = useState(false);

  useEffect(() => {
    const checkPageAccess = async () => {
      const permissionMan = new PermissionManager();
      await permissionMan.init();

      // Check if the user has access to the page
      const accessGranted = await permissionMan.hasPageAccess(pageName);
      setHasPageAccess(accessGranted);
    };

    checkPageAccess();
  }, [pageName]);

  return hasPageAccess ? <>{children}</> : null;
}

export default CheckPageAccess;
