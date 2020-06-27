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
 * @param {...string[]} permissions
 * @returns
 */
export function HasPermission(...permissions: string[]) {
  return (target: any, methodName: string, desc: PropertyDescriptor) => {
    const oldMethod = desc.value;
    // 重新定义方法体
    desc.value = function(...args: any[]) {
      if (permissions && permissions.length > 0) {
        let canPass = false;
        permissions.forEach(permission => {
          if (permissionList.find(per => per.operating === permission)) canPass = true;
          if (permissionList.find(per => per.route === permission)) canPass = true;
        });
        if (canPass) oldMethod.apply(this, args);
        else {
          notification.error('失败', `你没有【${permissions.toString()}】权限，请联系管理员`, {
            nzDuration: 3000,
          });
        }
      } else {
        oldMethod.apply(this, args);
      }
    };
  };
}
