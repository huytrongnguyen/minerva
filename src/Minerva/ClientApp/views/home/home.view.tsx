import { useEffect } from 'react';
// import { useSubject } from 'versa';
// import { GroupListModel } from '../core/fanza.model';

export function HomeView() {
  // const [groupList] = useSubject(GroupListModel);

  // useEffect(() => {
  //   GroupListModel.load();
  // }, [])

  return <>
    <div className="container-fluid">
      <div className="list-group">
        {/* {groupList?.map(group => <div role="button" className="list-group-item list-group-item-action">
          <a href={group.code}>{group.name}</a>
        </div>)} */}
      </div>
    </div>

  </>
}