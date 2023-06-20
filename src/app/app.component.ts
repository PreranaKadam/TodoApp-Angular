import { Component } from '@angular/core';
import { LocalStorageService } from 'ngx-webstorage';

interface Task {
  title?: string;
  dateCreated: string;
  priority: string;
  status: string;
  bucketName?: string;
  editMode?: boolean;
  editModeForStatus?: boolean;
}

interface Bucket {
  bucketName: string;
  tasks: Task[];
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  buckets: Bucket[] = [
    {
      "bucketName": "Personal",
      "tasks": [
        {
          "title": "Go for a jog",
          "dateCreated": "2023-06-18",
          "priority": "Medium",
          "status": "Complete"
        },
        {
          "title": "Read a book",
          "dateCreated": "2023-06-17",
          "priority": "High",
          "status": "Complete"
        },
        {
          "title": "Pay bills",
          "dateCreated": "2023-06-18",
          "priority": "High",
          "status": "Pending"
        }
      ]
    },
    {
      "bucketName": "Work",
      "tasks": [
        {
          "title": "Prepare presentation",
          "dateCreated": "2023-06-18",
          "priority": "High",
          "status": "WIP"
        },
        {
          "title": "Reply to emails",
          "dateCreated": "2023-06-18",
          "priority": "Medium",
          "status": "Pending"
        },
        {
          "title": "Schedule meeting",
          "dateCreated": "2023-06-17",
          "priority": "Medium",
          "status": "Complete"
        }
      ]
    }
  ];
  tasks: any[] = [];
  newTaskForm: any = { title: '', dateCreated: '', priority: '', status: '' };
  selectedBucket: string = '';
  sortOrders: { [bucketName: string]: 'asc' | 'desc' } = {};

  selectedPriority: string = '';
  showPriorityFilter: boolean = false;
  displayedTasks: Task[] = [];
  newBucketName: string = '';

  constructor(private localStorage: LocalStorageService) {
    this.newTaskForm = {
      title: '',
      dateCreated: '',
      priority: '',
      status: ''
    };
  }
  ngOnInit() {
    const storedBuckets = localStorage.getItem('buckets');
    if (storedBuckets) {
      this.buckets = JSON.parse(storedBuckets);
    }

    // iterate over the buckets and fetch task data from local storage
    for (const bucket of this.buckets) {
      const storedTasks = localStorage.getItem(bucket.bucketName);
      if (storedTasks) {
        bucket.tasks = JSON.parse(storedTasks);
      }
    }
  }
  saveDataToLocalStorage() {
    // Save buckets and task data to local storage
    localStorage.setItem('buckets', JSON.stringify(this.buckets));
    for (const bucket of this.buckets) {
      localStorage.setItem(bucket.bucketName, JSON.stringify(bucket.tasks));
    }
  }
  bucketOptions: string[] = ['Personal', 'Work'];
  createBucket(newBucketName: string) {
    if (newBucketName) {
      const newBucket: Bucket = {
        bucketName: newBucketName,
        tasks: []
      };
      this.buckets.push(newBucket);
      this.bucketOptions.push(newBucketName);
      this.localStorage.store('buckets', this.buckets);
      this.newBucketName = '';    //clear the input field
    }
  }

  createTask(newTask: any, bucketName: string) {
    const task: Task = {
      title: newTask?.title,
      dateCreated: newTask?.dateCreated,
      priority: newTask?.priority,
      status: newTask?.status,
      bucketName: bucketName
    };
    const bucket = this.buckets.find((bucket) => bucket.bucketName === bucketName);

    if (bucket !== undefined) {
      bucket.tasks.push(task);
    }
    this.saveDataToLocalStorage();
    // clear the form fields and selected bucket
    this.newTaskForm = { title: '', dateCreated: '', priority: '', status: '' };
    this.selectedBucket = '';
  }

  editTask(task: Task) {
    // find task within the buckets and update the values
    task.editMode = true;
    for (const bucket of this.buckets) {
      const taskIndex = bucket.tasks.findIndex((t: any) => t.title === task.title);
      if (taskIndex !== -1) {
        bucket.tasks[taskIndex] = task;
        break;
      }
    }
  }

  updateStatus(task: Task) {
    // Find task within the buckets and update its status
    task.editModeForStatus = true;
    for (const bucket of this.buckets) {
      const taskIndex = bucket.tasks.findIndex((t: any) => t.title === task.title);
      if (taskIndex !== -1) {
        bucket.tasks[taskIndex].status = task.status;
        break;
      }
    }
  }

  //delete the particular task
  deleteTask(task: Task) {
    for (const bucket of this.buckets) {
      const taskIndex = bucket.tasks.findIndex((t: any) => t.title === task.title);
      if (taskIndex !== -1) {
        bucket.tasks.splice(taskIndex, 1);
        break;
      }
    }
  }

  // function to save upadted tasks
  saveTask(task: Task) {
    if (task.editMode) {
      task.editMode = false;
      for (const bucket of this.buckets) {
        const taskIndex = bucket.tasks.findIndex((t: Task) => t.title === task.title);
        if (taskIndex !== -1) {
          bucket.tasks[taskIndex] = task;
          break;
        }
      }
    }
    if (task.editModeForStatus) {
      task.editModeForStatus = false;
      const updatedStatus = task.status;
      for (const bucket of this.buckets) {
        const taskIndex = bucket.tasks.findIndex((t: Task) => t.title === task.title);
        if (taskIndex !== -1) {
          bucket.tasks[taskIndex].status = updatedStatus;
          break;
        }
      }
    }
  }

  //function for sorting dateCreated field
  sortTasksByDate(bucketName: string, sortOrder: 'asc' | 'desc') {
    const bucket = this.buckets.find((bucket) => bucket.bucketName === bucketName);
    if (bucket) {
      bucket.tasks.sort((a: Task, b: Task) => {
        const dateA = new Date(a.dateCreated);
        const dateB = new Date(b.dateCreated);

        if (sortOrder === 'asc') {
          return dateA > dateB ? 1 : -1;
        } else {
          return dateA < dateB ? 1 : -1;
        }
      });
    }
  }
  //function for toggling between ascending and descending
  toggleSortOrder(bucketName: string) {
    if (this.sortOrders[bucketName] === 'asc') {
      this.sortOrders[bucketName] = 'desc';
    } else {
      this.sortOrders[bucketName] = 'asc';
    }
    this.sortTasksByDate(bucketName, this.sortOrders[bucketName]);
  }

  // to filter the data based on priority
  bucketFilters: { [key: string]: Task[] } = {};

  filterByPriority(priority: string, bucketName: string) {
    const bucket = this.buckets.find(bucket => bucket.bucketName === bucketName);
    if (bucket) {
      if (priority === 'Low') {
        this.bucketFilters[bucketName] = bucket.tasks.filter(task => task.priority === 'Low');
      } else if (priority === 'Medium') {
        this.bucketFilters[bucketName] = bucket.tasks.filter(task => task.priority === 'Medium');
      } else if (priority === 'High') {
        this.bucketFilters[bucketName] = bucket.tasks.filter(task => task.priority === 'High');
      } else {
        this.bucketFilters[bucketName] = bucket.tasks;
      }
    }
  }
}
