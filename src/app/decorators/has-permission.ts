import { PermissionDetail } from '@/types/premission';
import { NzNotificationService } from 'ng-zorro-antd';

let notification: NzNotificationService = null;

export function setNotification(nf: NzNotificationService) {
  notification = nf;
}

const permissionList: PermissionDetail[] = [];

export function setPermissionList(list: PermissionDetail[]) {
  list.forEach(li => {
    if (!permissionList.find(permission => permission.id === li.id)) permissionList.push(li);
  });
}

/**
 * 按钮权限控制
 *
 * @export
 * @param {string} permissionName
 * @returns
 */
export function HasPermission(permissionName: string) {
  return (target: any, methodName: string, desc: PropertyDescriptor) => {
    const oldMethod = desc.value;
    // 重新定义方法体
    desc.value = function(...args: any[]) {
      if (
        permissionList.find(permission => permission.operating === permissionName)
        ||
        permissionList.find(permission => permission.route === permissionName)
      ) {
        oldMethod.apply(this, args);
      } else {
        notification.error('失败', `你没有【${permissionName}】权限，请联系管理员`, {
          nzDuration: 3000,
        });
      }
    };
  };
}
