import {initData, useSignal} from "@telegram-apps/sdk-react";

const UserInfo = () => {
    const initDataState = useSignal(initData.state);

    if (!initDataState) {
        return 'Loading...';
    }

    if (!initDataState.user) {
        return 'No user info'
    }

    return (<div className='flex items-center justify-between gap-2'>
        <img src={initDataState.user.photoUrl} className='h-10 w-10 rounded-full' alt='logo'/>
        <span>{initDataState.user.firstName}</span>
    </div>)
}

export default UserInfo;