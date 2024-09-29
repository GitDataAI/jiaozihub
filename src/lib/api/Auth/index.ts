import { AuthenticationError, apiRequest, cache, extractError} from "../index"
import { UserInfo } from "../interface/Api";
export class Auth {
    clearCurrentUser() {
        cache.delete('user');
        cache.delete('token');
    }

    async getCurrentUserWithCache() {
        let user = cache.get('user')
        if (!user) {
            user = await this.getCurrentUser();
            cache.set('user', user);
        }
        return user
    }

    async getCurrentUser() {
        const userResponse = await apiRequest('/users/user')
        const body = await userResponse.json();
        return body.user;
    }

 
    //fixui2.0 Login returns a JSON object containing the information of the authentication token
    async login(username: string, password: string) {
        await apiRequest(`/auth/login`, { 
            method: 'POST', 
            body: JSON.stringify({ name:username, password }) 
        }).then(async(response)=>{
            this.clearCurrentUser()
            const logininfo  = await response.json()
            const user = await this.getUserInfo(logininfo.token)
            cache.set('user', user.name)
            return response.json()
        }).catch(async(err)=>{
                const errorBody = await extractError(err);
                switch (err.status) {
                    case 401:
                        throw new AuthenticationError(errorBody, err.status);
                    case 420:
                        throw new Error(`Too many requests: ${errorBody}`);
                    default:
                        throw new Error(`Internal server error: ${errorBody}`);
                }
        });
    }
    //fixui2.0 Obtain the information of the current logged-in user and return a JSON object containing the user information
    async getUserInfo(token:string):Promise<UserInfo>{
        let headers = new Headers()
        headers.append("Authorization", token)
        const response = await apiRequest(`/users/user`, { method: 'GET' },headers);
        if (!response.ok) {
            const errorBody = await extractError(response);
            switch (response.status) {
                case 401:
                    throw new AuthenticationError(errorBody, response.status);
                default:
                    throw new Error(`Internal server error: ${errorBody}`);
            }
        }

        return response.json();
    }
    
    //fixui2.0 Log out of login
    async logout() {
        const response = await apiRequest(`/auth/logout`, { method: 'POST' });
        if (!response.ok) {
            const errorBody = await extractError(response);
            switch (response.status) {
                case 401:
                    throw new AuthenticationError(errorBody, response.status);
                case 420:
                    throw new Error(`Too many requests: ${errorBody}`);
                default:
                    throw new Error(`Unhandled error status: ${response.status}`);
            }
        }
        return response.json();
    }
    
}
