import React, { ReactNode, useEffect, useState } from "react";
import { Pressable, TouchableOpacity } from "react-native";

import { PermissionManager } from "@utils/permissionManager";

import { Button } from "./ui/button";
import { TextareaInput } from "./ui/textarea";

type ChildProps = {
  children?: ReactNode;
  onPress?: (...args: unknown[]) => void;
  isDisabled?: boolean;
  disabled?: boolean;
};

function disableChildrenRecursively(children: ReactNode, disabled: boolean): ReactNode {
  return React.Children.map(children, (child) => {
    if (!React.isValidElement(child)) return child;

    const element = child as React.ReactElement<ChildProps>;
    const nestedChildren = element.props.children
      ? disableChildrenRecursively(element.props.children, disabled)
      : element.props.children;

    if (element.type === TouchableOpacity) {
      return React.cloneElement(element, {
        disabled,
        onPress: disabled ? undefined : element.props.onPress,
        children: nestedChildren,
      });
    }

    if (element.type === Pressable) {
      return React.cloneElement(element, {
        disabled,
        onPress: disabled ? undefined : element.props.onPress,
        children: nestedChildren,
      });
    }

    if (element.type === Button || element.type === TextareaInput) {
      return React.cloneElement(element, {
        isDisabled: disabled,
        onPress: disabled ? undefined : element.props.onPress,
        children: nestedChildren,
      });
    }

    return React.cloneElement(element, {
      children: nestedChildren,
    });
  });
}

interface CheckPermissionProps {
  requiredPermission: string[];
  showIfNotPermitted?: boolean;
  children: ReactNode;
}

function CheckPermission({ requiredPermission, showIfNotPermitted = false, children }: CheckPermissionProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    let isMounted = true;

    if (requiredPermission.length === 0) {
      setHasPermission(true);
      return () => {
        isMounted = false;
      };
    }

    const checkPermissions = async () => {
      const permissionMan = new PermissionManager();
      await permissionMan.init();

      const permission = permissionMan.hasAllPermissions(requiredPermission);

      if (isMounted) {
        setHasPermission(permission);
      }
    };

    checkPermissions();

    return () => {
      isMounted = false;
    };
  }, [requiredPermission]);

  if (hasPermission === null) {
    if (showIfNotPermitted) {
      return disableChildrenRecursively(children, true);
    }
    return <>{children}</>;
  }

  if (hasPermission) {
    return <>{children}</>;
  }
  if (showIfNotPermitted) {
    return disableChildrenRecursively(children, true);
  }
  return null;
}

export default CheckPermission;
