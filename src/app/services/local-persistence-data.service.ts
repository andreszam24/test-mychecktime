export class LocalPersistenceDataService {
  
    protected saveLocalData(key: string, data: any) {
      localStorage.setItem(key, JSON.stringify(data));
    }
  
    protected getLocalData(key: string): any {
      return JSON.parse(localStorage.getItem(key)?? "[]");
    }
  }
  