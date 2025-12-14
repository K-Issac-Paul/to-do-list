import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Check, X, ChevronDown, ChevronRight, Calendar, Clock } from 'lucide-react';

// Main App Component
export default function App() {
  const [tasks, setTasks] = useState([]);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [expandedDates, setExpandedDates] = useState(new Set());

  // Load tasks from localStorage on mount
  useEffect(() => {
    const savedTasks = localStorage.getItem('todoTasks');
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
  }, []);

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('todoTasks', JSON.stringify(tasks));
  }, [tasks]);

  // Add new task
  const addTask = (title, description, dueDate) => {
    const newTask = {
      id: Date.now(),
      title,
      description,
      dueDate,
      createdAt: new Date().toISOString(),
      completedAt: null,
      status: 'remaining'
    };
    setTasks([...tasks, newTask]);
    setIsAddingTask(false);
  };

  // Edit task
  const editTask = (id, title, description, dueDate) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, title, description, dueDate } : task
    ));
  };

  // Delete task
  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  // Toggle task status
  const toggleTaskStatus = (id, newStatus) => {
    setTasks(tasks.map(task =>
      task.id === id
        ? {
            ...task,
            status: newStatus,
            completedAt: newStatus === 'completed' ? new Date().toISOString() : null
          }
        : task
    ));
  };

  // Group tasks by date
  const groupTasksByDate = () => {
    const grouped = {};
    tasks.forEach(task => {
      const date = new Date(task.createdAt).toISOString().split('T')[0];
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(task);
    });
    return grouped;
  };

  // Toggle date folder expansion
  const toggleDateExpansion = (date) => {
    const newExpanded = new Set(expandedDates);
    if (newExpanded.has(date)) {
      newExpanded.delete(date);
    } else {
      newExpanded.add(date);
    }
    setExpandedDates(newExpanded);
  };

  const groupedTasks = groupTasksByDate();
  const sortedDates = Object.keys(groupedTasks).sort().reverse();

  // Calculate statistics
  const activeTasks = tasks.filter(t => t.status === 'active').length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const remainingTasks = tasks.filter(t => t.status === 'remaining').length;

  return (
    <div style={styles.app}>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.headerContainer}>
          <div style={styles.header}>
            <h1 style={styles.title}>Task Manager</h1>
            <p style={styles.subtitle}>Organize your tasks efficiently</p>
          </div>
          <div style={styles.currentDateDisplay}>
            <Calendar size={24} style={{color: '#60a5fa'}} />
            <div>
              <div style={styles.currentDateLabel}>Today's Date</div>
              <div style={styles.currentDateValue}>{new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</div>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div style={styles.statsGrid}>
          <StatCard title="Active" count={activeTasks} color="blue" />
          <StatCard title="Completed" count={completedTasks} color="green" />
          <StatCard title="Remaining" count={remainingTasks} color="yellow" />
        </div>

        {/* Add Task Button */}
        <button onClick={() => setIsAddingTask(true)} style={styles.addTaskBtn}>
          <Plus size={20} />
          <span>Add New Task</span>
        </button>

        {/* Add Task Form */}
        {isAddingTask && (
          <TaskForm
            onSubmit={addTask}
            onCancel={() => setIsAddingTask(false)}
          />
        )}

        {/* Date Folders */}
        <div style={styles.dateFolders}>
          {sortedDates.length === 0 ? (
            <div style={styles.emptyState}>
              <Calendar size={48} style={styles.emptyIcon} />
              <p>No tasks yet. Add your first task to get started!</p>
            </div>
          ) : (
            sortedDates.map(date => (
              <DateFolder
                key={date}
                date={date}
                tasks={groupedTasks[date]}
                isExpanded={expandedDates.has(date)}
                onToggle={() => toggleDateExpansion(date)}
                onEdit={editTask}
                onDelete={deleteTask}
                onToggleStatus={toggleTaskStatus}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// Statistics Card Component
function StatCard({ title, count, color }) {
  const cardStyle = {
    ...styles.statCard,
    ...(color === 'blue' ? styles.statCardBlue : 
        color === 'green' ? styles.statCardGreen : 
        styles.statCardYellow)
  };

  return (
    <div style={cardStyle}>
      <div style={styles.statTitle}>{title}</div>
      <div style={styles.statCount}>{count}</div>
    </div>
  );
}

// Task Form Component
function TaskForm({ onSubmit, onCancel }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');

  const handleSubmit = () => {
    if (title.trim()) {
      onSubmit(title, description, dueDate);
      setTitle('');
      setDescription('');
      setDueDate('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div style={styles.taskForm}>
      <input
        type="text"
        placeholder="Task title *"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyPress={handleKeyPress}
        style={styles.formInput}
        autoFocus
      />
      <textarea
        placeholder="Task description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        style={styles.formTextarea}
        rows="3"
      />
      <div style={styles.dueDateContainer}>
        <label style={styles.dueDateLabel}>Due Date:</label>
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          style={styles.formInput}
        />
      </div>
      <div style={styles.formActions}>
        <button onClick={handleSubmit} style={{...styles.btn, ...styles.btnPrimary}}>
          <Check size={18} />
          <span>Add Task</span>
        </button>
        <button onClick={onCancel} style={{...styles.btn, ...styles.btnSecondary}}>
          <X size={18} />
          <span>Cancel</span>
        </button>
      </div>
    </div>
  );
}

// Date Folder Component
function DateFolder({ date, tasks, isExpanded, onToggle, onEdit, onDelete, onToggleStatus }) {
  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const activeTasks = tasks.filter(t => t.status === 'active');
  const completedTasks = tasks.filter(t => t.status === 'completed');
  const remainingTasks = tasks.filter(t => t.status === 'remaining');

  return (
    <div style={styles.dateFolder}>
      <button onClick={onToggle} style={styles.dateHeader}>
        <div style={styles.dateHeaderLeft}>
          {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          <Calendar size={20} style={styles.calendarIcon} />
          <span style={styles.dateText}>{formatDate(date)}</span>
          <span style={styles.taskCount}>({tasks.length} tasks)</span>
        </div>
        <div style={styles.dateStats}>
          <span style={styles.statActive}>Active: {activeTasks.length}</span>
          <span style={styles.statCompleted}>Completed: {completedTasks.length}</span>
          <span style={styles.statRemaining}>Remaining: {remainingTasks.length}</span>
        </div>
      </button>

      {isExpanded && (
        <div style={styles.taskSections}>
          {activeTasks.length > 0 && (
            <TaskSection
              title="Active Tasks"
              tasks={activeTasks}
              color="blue"
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleStatus={onToggleStatus}
            />
          )}
          
          {remainingTasks.length > 0 && (
            <TaskSection
              title="Remaining Tasks"
              tasks={remainingTasks}
              color="yellow"
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleStatus={onToggleStatus}
            />
          )}
          
          {completedTasks.length > 0 && (
            <TaskSection
              title="Completed Tasks"
              tasks={completedTasks}
              color="green"
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleStatus={onToggleStatus}
            />
          )}
        </div>
      )}
    </div>
  );
}

// Task Section Component
function TaskSection({ title, tasks, color, onEdit, onDelete, onToggleStatus }) {
  const sectionTitleStyle = {
    ...styles.sectionTitle,
    ...(color === 'blue' ? styles.sectionTitleBlue :
        color === 'green' ? styles.sectionTitleGreen :
        styles.sectionTitleYellow)
  };

  return (
    <div style={styles.taskSection}>
      <h3 style={sectionTitleStyle}>
        {title} ({tasks.length})
      </h3>
      <div style={styles.taskList}>
        {tasks.map(task => (
          <TaskItem
            key={task.id}
            task={task}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggleStatus={onToggleStatus}
          />
        ))}
      </div>
    </div>
  );
}

// Task Item Component
function TaskItem({ task, onEdit, onDelete, onToggleStatus }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description);
  const [editDueDate, setEditDueDate] = useState(task.dueDate || '');

  const formatDateTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDueDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const isDueSoon = (dateString) => {
    if (!dateString) return false;
    const due = new Date(dateString);
    const today = new Date();
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 3;
  };

  const isOverdue = (dateString) => {
    if (!dateString) return false;
    const due = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    return due < today && task.status !== 'completed';
  };

  const handleEdit = () => {
    if (editTitle.trim()) {
      onEdit(task.id, editTitle, editDescription, editDueDate);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <div style={{...styles.taskItem, ...styles.taskEdit}}>
        <input
          type="text"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          style={styles.editInput}
          autoFocus
        />
        <textarea
          value={editDescription}
          onChange={(e) => setEditDescription(e.target.value)}
          style={styles.editTextarea}
          rows="2"
        />
        <div style={styles.dueDateContainer}>
          <label style={styles.dueDateLabel}>Due Date:</label>
          <input
            type="date"
            value={editDueDate}
            onChange={(e) => setEditDueDate(e.target.value)}
            style={styles.editInput}
          />
        </div>
        <div style={styles.editActions}>
          <button onClick={handleEdit} style={{...styles.btn, ...styles.btnSave}}>
            <Check size={16} />
            <span>Save</span>
          </button>
          <button onClick={() => setIsEditing(false)} style={{...styles.btn, ...styles.btnCancel}}>
            <X size={16} />
            <span>Cancel</span>
          </button>
        </div>
      </div>
    );
  }

  const itemStyle = task.status === 'completed' 
    ? {...styles.taskItem, ...styles.taskCompleted}
    : styles.taskItem;

  return (
    <div style={itemStyle}>
      <div style={styles.taskContent}>
        <h4 style={task.status === 'completed' ? styles.taskTitleCompleted : styles.taskTitle}>
          {task.title}
        </h4>
        {task.description && (
          <p style={task.status === 'completed' ? styles.taskDescCompleted : styles.taskDesc}>
            {task.description}
          </p>
        )}
        <div style={styles.taskMeta}>
          <span style={styles.metaItem}>
            <Clock size={12} />
            <span style={{marginLeft: '4px'}}>Created: {formatDateTime(task.createdAt)}</span>
          </span>
          {task.dueDate && (
            <span style={{
              ...styles.metaItem,
              ...(isOverdue(task.dueDate) ? styles.metaOverdue : 
                  isDueSoon(task.dueDate) ? styles.metaDueSoon : {})
            }}>
              <Calendar size={12} />
              <span style={{marginLeft: '4px'}}>
                Due: {formatDueDate(task.dueDate)}
                {isOverdue(task.dueDate) && ' (Overdue!)'}
                {isDueSoon(task.dueDate) && !isOverdue(task.dueDate) && ' (Due Soon)'}
              </span>
            </span>
          )}
          {task.completedAt && (
            <span style={{...styles.metaItem, ...styles.metaCompleted}}>
              <Check size={12} />
              <span style={{marginLeft: '4px'}}>Completed: {formatDateTime(task.completedAt)}</span>
            </span>
          )}
        </div>
      </div>
      
      <div style={styles.taskActions}>
        {task.status !== 'completed' && (
          <>
            <button
              onClick={() => onToggleStatus(task.id, task.status === 'active' ? 'remaining' : 'active')}
              style={task.status === 'active' ? {...styles.actionBtn, ...styles.btnPause} : {...styles.actionBtn, ...styles.btnPlay}}
              title={task.status === 'active' ? 'Move to Remaining' : 'Mark as Active'}
            >
              {task.status === 'active' ? '⏸' : '▶'}
            </button>
            <button
              onClick={() => onToggleStatus(task.id, 'completed')}
              style={{...styles.actionBtn, ...styles.btnComplete}}
              title="Mark as Completed"
            >
              <Check size={16} />
            </button>
          </>
        )}
        {task.status === 'completed' && (
          <button
            onClick={() => onToggleStatus(task.id, 'remaining')}
            style={{...styles.actionBtn, ...styles.btnReopen}}
            title="Reopen Task"
          >
            ↺
          </button>
        )}
        <button
          onClick={() => setIsEditing(true)}
          style={{...styles.actionBtn, ...styles.btnEdit}}
          title="Edit Task"
        >
          <Edit2 size={16} />
        </button>
        <button
          onClick={() => onDelete(task.id)}
          style={{...styles.actionBtn, ...styles.btnDelete}}
          title="Delete Task"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}

// Inline Styles Object
const styles = {
  app: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    color: '#f1f1f1',
    padding: '2rem 1rem',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif'
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto'
  },
  headerContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '2rem',
    gap: '2rem',
    flexWrap: 'wrap'
  },
  header: {
    flex: 1,
    minWidth: '250px'
  },
  currentDateDisplay: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    background: 'linear-gradient(135deg, #1f2937, #374151)',
    padding: '1.25rem 1.5rem',
    borderRadius: '0.75rem',
    border: '1px solid #4b5563',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
    minWidth: '280px'
  },
  currentDateLabel: {
    fontSize: '0.75rem',
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '0.25rem'
  },
  currentDateValue: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#f1f1f1'
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    marginBottom: '0.5rem',
    background: 'linear-gradient(to right, #60a5fa, #a78bfa)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  },
  subtitle: {
    color: '#9ca3af',
    fontSize: '1rem'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1rem',
    marginBottom: '2rem'
  },
  statCard: {
    padding: '1.5rem',
    borderRadius: '0.75rem',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
    transition: 'transform 0.2s'
  },
  statCardBlue: {
    background: 'linear-gradient(135deg, #2563eb, #1d4ed8)'
  },
  statCardGreen: {
    background: 'linear-gradient(135deg, #16a34a, #15803d)'
  },
  statCardYellow: {
    background: 'linear-gradient(135deg, #ca8a04, #a16207)'
  },
  statTitle: {
    color: '#e5e7eb',
    fontSize: '0.875rem',
    fontWeight: '500',
    marginBottom: '0.5rem'
  },
  statCount: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: 'white'
  },
  addTaskBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: '#2563eb',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '0.5rem',
    fontSize: '1rem',
    cursor: 'pointer',
    marginBottom: '1.5rem',
    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)'
  },
  taskForm: {
    background: '#1f2937',
    border: '1px solid #374151',
    borderRadius: '0.75rem',
    padding: '1.5rem',
    marginBottom: '1.5rem',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
  },
  formInput: {
    width: '95%',
    background: '#374151',
    border: '1px solid #4b5563',
    borderRadius: '0.5rem',
    padding: '0.75rem 1rem',
    color: '#f1f1f1',
    fontSize: '1rem',
    marginBottom: '1rem'
  },
  formTextarea: {
    width: '95%',
    background: '#374151',
    border: '1px solid #4b5563',
    borderRadius: '0.5rem',
    padding: '0.75rem 1rem',
    color: '#f1f1f1',
    fontSize: '1rem',
    marginBottom: '1rem',
    fontFamily: 'inherit',
    resize: 'none'
  },
  editInput: {
    width: '100%',
    background: '#4b5563',
    border: '1px solid #6b7280',
    borderRadius: '0.5rem',
    padding: '0.75rem 1rem',
    color: '#f1f1f1',
    fontSize: '1rem',
    marginBottom: '1rem'
  },
  editTextarea: {
    width: '100%',
    background: '#4b5563',
    border: '1px solid #6b7280',
    borderRadius: '0.5rem',
    padding: '0.75rem 1rem',
    color: '#f1f1f1',
    fontSize: '1rem',
    marginBottom: '1rem',
    fontFamily: 'inherit',
    resize: 'none'
  },
  formActions: {
    display: 'flex',
    gap: '0.75rem'
  },
  editActions: {
    display: 'flex',
    gap: '0.5rem'
  },
  btn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 1.5rem',
    border: 'none',
    borderRadius: '0.5rem',
    fontSize: '1rem',
    cursor: 'pointer'
  },
  btnPrimary: {
    background: '#2563eb',
    color: 'white'
  },
  btnSecondary: {
    background: '#374151',
    color: 'white'
  },
  btnSave: {
    background: '#2563eb',
    color: 'white',
    padding: '0.375rem 1rem',
    fontSize: '0.875rem'
  },
  btnCancel: {
    background: '#4b5563',
    color: 'white',
    padding: '0.375rem 1rem',
    fontSize: '0.875rem'
  },
  emptyState: {
    textAlign: 'center',
    padding: '3rem',
    color: '#6b7280'
  },
  emptyIcon: {
    margin: '0 auto 1rem',
    opacity: 0.5
  },
  dateFolders: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  dateFolder: {
    background: '#1f2937',
    border: '1px solid #374151',
    borderRadius: '0.75rem',
    overflow: 'hidden',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
  },
  dateHeader: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1.25rem',
    background: 'transparent',
    border: 'none',
    color: '#f1f1f1',
    cursor: 'pointer'
  },
  dateHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem'
  },
  calendarIcon: {
    color: '#60a5fa'
  },
  dateText: {
    fontWeight: '600',
    fontSize: '1.125rem'
  },
  taskCount: {
    color: '#6b7280',
    fontSize: '0.875rem'
  },
  dateStats: {
    display: 'flex',
    gap: '1rem',
    fontSize: '0.875rem'
  },
  statActive: {
    color: '#60a5fa'
  },
  statCompleted: {
    color: '#34d399'
  },
  statRemaining: {
    color: '#fbbf24'
  },
  taskSections: {
    padding: '0 1.25rem 1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem'
  },
  taskSection: {
    marginTop: '1rem'
  },
  sectionTitle: {
    fontSize: '0.875rem',
    fontWeight: '600',
    marginBottom: '0.75rem',
    paddingLeft: '0.75rem',
    borderLeft: '4px solid'
  },
  sectionTitleBlue: {
    color: '#60a5fa',
    borderColor: '#2563eb'
  },
  sectionTitleGreen: {
    color: '#34d399',
    borderColor: '#16a34a'
  },
  sectionTitleYellow: {
    color: '#fbbf24',
    borderColor: '#ca8a04'
  },
  taskList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem'
  },
  taskItem: {
    background: '#374151',
    border: '1px solid #4b5563',
    borderRadius: '0.5rem',
    padding: '1rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '1rem'
  },
  taskCompleted: {
    opacity: 0.6
  },
  taskEdit: {
    flexDirection: 'column'
  },
  taskContent: {
    flex: 1
  },
  taskTitle: {
    fontWeight: '500',
    marginBottom: '0.5rem',
    color: '#f1f1f1'
  },
  taskTitleCompleted: {
    fontWeight: '500',
    marginBottom: '0.5rem',
    color: '#9ca3af',
    textDecoration: 'line-through'
  },
  taskDesc: {
    fontSize: '0.875rem',
    color: '#9ca3af',
    marginBottom: '0.5rem'
  },
  taskDescCompleted: {
    fontSize: '0.875rem',
    color: '#6b7280',
    textDecoration: 'line-through',
    marginBottom: '0.5rem'
  },
  taskMeta: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.75rem',
    fontSize: '0.75rem',
    color: '#6b7280'
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem'
  },
  metaCompleted: {
    color: '#34d399'
  },
  metaDueSoon: {
    color: '#fbbf24',
    fontWeight: '600'
  },
  metaOverdue: {
    color: '#ef4444',
    fontWeight: '600'
  },
  dueDateContainer: {
    marginBottom: '1rem'
  },
  dueDateLabel: {
    display: 'block',
    color: '#9ca3af',
    fontSize: '0.875rem',
    marginBottom: '0.5rem'
  },
  taskActions: {
    display: 'flex',
    gap: '0.5rem',
    flexShrink: 0
  },
  actionBtn: {
    padding: '0.5rem',
    border: 'none',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white'
  },
  btnPlay: {
    background: '#2563eb'
  },
  btnPause: {
    background: '#ca8a04'
  },
  btnComplete: {
    background: '#16a34a'
  },
  btnReopen: {
    background: '#ca8a04',
    fontSize: '1.25rem'
  },
  btnEdit: {
    background: '#4b5563'
  },
  btnDelete: {
    background: '#dc2626'
  }
};
