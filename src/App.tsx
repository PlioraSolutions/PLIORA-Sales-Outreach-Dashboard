import { useEffect, useMemo, useState, type FormEvent, type DragEvent } from 'react';
import './App.css';

const pipelineStages = [
  'New',
  'To Research',
  'Ready to Contact',
  'Contacted',
  'Replied',
  'Follow-up Due',
  'Interested',
  'Meeting Scheduled',
  'Proposal',
  'Won',
  'Lost',
  'Not a Fit',
];

const menuItems = [
  'Dashboard',
  'Leads',
  'Pipeline',
  'Campaigns',
  'Outreach Workspace',
  'Templates',
  'Unified Inbox',
  'Follow-up Queue',
  'Task Calendar',
  'Team Directory',
  'Analytics',
  'Reports',
  'Integrations Overview',
  'Settings',
  'Notifications',
  'Audit Log',
];

type Lead = {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  status: string;
  owner: string;
  source: string;
  priority: string;
  notes: string;
  tags: string[];
  createdAt: string;
};

type Task = {
  id: string;
  title: string;
  date: string;
  time: string;
  lead: string;
  completed: boolean;
};

type Template = {
  id: string;
  name: string;
  channel: string;
  subject: string;
  message: string;
};

type Member = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
};

const initialLeads: Lead[] = [
  {
    id: '1',
    name: 'Aarav Shah',
    company: 'TechNova',
    email: 'aarav@technova.com',
    phone: '+91 98765 43210',
    status: 'New',
    owner: 'Admin',
    source: 'Website',
    priority: 'High',
    notes: 'Interested in learning more about our services.',
    tags: ['Technology', 'Potential Client'],
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Priya Patel',
    company: 'Bright Solutions',
    email: 'priya@bright.com',
    phone: '+91 98765 12345',
    status: 'Contacted',
    owner: 'Sales Team',
    source: 'LinkedIn',
    priority: 'Medium',
    notes: 'Initial contact completed. Waiting for response.',
    tags: ['Business', 'Follow-up'],
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Rohan Mehta',
    company: 'NextGen Labs',
    email: 'rohan@nextgen.com',
    phone: '+91 98765 67890',
    status: 'Interested',
    owner: 'Admin',
    source: 'Referral',
    priority: 'High',
    notes: 'Interested in discussing a possible collaboration.',
    tags: ['Interested', 'Technology'],
    createdAt: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'Neha Desai',
    company: 'CloudWorks',
    email: 'neha@cloudworks.com',
    phone: '+91 98765 11111',
    status: 'New',
    owner: 'Sales Team',
    source: 'Website',
    priority: 'Low',
    notes: 'Research required before contacting.',
    tags: ['Cloud', 'New Lead'],
    createdAt: new Date().toISOString(),
  },
];

const initialTemplates: Template[] = [
  {
    id: '1',
    name: 'Introduction Email',
    channel: 'Email',
    subject: 'Introduction from PLIORA',
    message: 'Hello, we would love to connect with you and introduce our services.',
  },
  {
    id: '2',
    name: 'Follow-up Message',
    channel: 'WhatsApp',
    subject: 'Following up',
    message: 'Hello, just following up on our previous conversation.',
  },
  {
    id: '3',
    name: 'LinkedIn Outreach',
    channel: 'LinkedIn',
    subject: 'Professional Connection',
    message: 'Hello, I would like to connect and explore opportunities.',
  },
];

const initialMembers: Member[] = [
  {
    id: '1',
    name: 'Admin',
    email: 'admin@pliora.com',
    role: 'Administrator',
    status: 'Active',
  },
  {
    id: '2',
    name: 'Sales Team',
    email: 'sales@pliora.com',
    role: 'Sales',
    status: 'Active',
  },
];

function load<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activePage, setActivePage] = useState('Dashboard');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [search, setSearch] = useState('');

  const [leads, setLeads] = useState<Lead[]>(() =>
    load('pliora_leads', initialLeads)
  );

  const [tasks, setTasks] = useState<Task[]>(() =>
    load('pliora_tasks', [])
  );

  const [templates, setTemplates] = useState<Template[]>(() =>
    load('pliora_templates', initialTemplates)
  );

  const [members, setMembers] = useState<Member[]>(() =>
    load('pliora_members', initialMembers)
  );

  const [notifications, setNotifications] = useState<string[]>(() =>
    load('pliora_notifications', [])
  );

  const [completedTasks, setCompletedTasks] = useState<string[]>(() =>
    load('pliora_completed', [])
  );

  const [settings, setSettings] = useState<Record<string, string>>(() =>
    load('pliora_settings', {
      fullName: 'Admin',
      organization: 'PLIORA Group',
      website: '',
      phone: '',
    })
  );

  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [editingLeadId, setEditingLeadId] = useState<string | null>(null);
  const [draggedEmail, setDraggedEmail] = useState<string | null>(null);

  const [leadForm, setLeadForm] = useState<Lead>({
    id: '',
    name: '',
    company: '',
    email: '',
    phone: '',
    status: 'New',
    owner: 'Admin',
    source: 'Manual Entry',
    priority: 'Medium',
    notes: '',
    tags: [],
    createdAt: new Date().toISOString(),
  });

  const [taskForm, setTaskForm] = useState({
    title: '',
    date: '',
    time: '',
    lead: '',
  });

  const [templateForm, setTemplateForm] = useState({
    name: '',
    channel: 'Email',
    subject: '',
    message: '',
  });

  const [memberForm, setMemberForm] = useState({
    name: '',
    email: '',
    role: 'Sales',
  });

  const [messageText, setMessageText] = useState('');
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [notice, setNotice] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [setupStep, setSetupStep] = useState(1);

  useEffect(() => {
    localStorage.setItem('pliora_leads', JSON.stringify(leads));
  }, [leads]);

  useEffect(() => {
    localStorage.setItem('pliora_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('pliora_templates', JSON.stringify(templates));
  }, [templates]);

  useEffect(() => {
    localStorage.setItem('pliora_members', JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    localStorage.setItem('pliora_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('pliora_completed', JSON.stringify(completedTasks));
  }, [completedTasks]);

  useEffect(() => {
    localStorage.setItem('pliora_settings', JSON.stringify(settings));
  }, [settings]);

  const selectedLead = leads.find(
    (lead) => lead.id === selectedLeadId
  );

  const filteredLeads = useMemo(
    () =>
      leads.filter((lead) =>
        `${lead.name} ${lead.company} ${lead.email} ${lead.phone}`
          .toLowerCase()
          .includes(search.toLowerCase())
      ),
    [leads, search]
  );

  const openPage = (page: string) => {
    setActivePage(page);
    setSearch('');
    setNotice('');
  };

  const inform = (message: string) => {
    setNotice(message);
    setNotifications((previous) =>
      [message, ...previous].slice(0, 30)
    );
  };

  const blankLead = (): Lead => ({
    id: '',
    name: '',
    company: '',
    email: '',
    phone: '',
    status: 'New',
    owner: 'Admin',
    source: 'Manual Entry',
    priority: 'Medium',
    notes: '',
    tags: [],
    createdAt: new Date().toISOString(),
  });

  function submitLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoggedIn(true);
    openPage('Dashboard');
  }

  function saveLead(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (editingLeadId) {
      setLeads((previous) =>
        previous.map((lead) =>
          lead.id === editingLeadId
            ? { ...leadForm, id: editingLeadId }
            : lead
        )
      );

      inform('Lead updated.');
    } else {
      const item = {
        ...leadForm,
        id: crypto.randomUUID(),
      };

      setLeads((previous) => [item, ...previous]);
      inform('Lead created.');
    }

    setShowLeadForm(false);
    setEditingLeadId(null);
    setLeadForm(blankLead());
  }

  function editLead(lead: Lead) {
    setLeadForm({ ...lead });
    setEditingLeadId(lead.id);
    setShowLeadForm(true);
  }

  function deleteLead(id: string) {
    if (window.confirm('Delete this lead?')) {
      setLeads((previous) =>
        previous.filter((lead) => lead.id !== id)
      );

      if (selectedLeadId === id) {
        setSelectedLeadId(null);
      }

      inform('Lead deleted.');
    }
  }

  function changeStatus(id: string, status: string) {
    setLeads((previous) =>
      previous.map((lead) =>
        lead.id === id ? { ...lead, status } : lead
      )
    );
  }

  function dragStart(
    event: DragEvent<HTMLDivElement>,
    id: string
  ) {
    setDraggedEmail(id);
    event.dataTransfer.setData('text/plain', id);
  }

  function dropLead(
    event: DragEvent<HTMLDivElement>,
    status: string
  ) {
    event.preventDefault();

    const id =
      event.dataTransfer.getData('text/plain') || draggedEmail;

    if (id) {
      changeStatus(id, status);
    }

    setDraggedEmail(null);
  }

  function addTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setTasks((previous) => [
      {
        ...taskForm,
        id: crypto.randomUUID(),
        completed: false,
      },
      ...previous,
    ]);

    setTaskForm({
      title: '',
      date: '',
      time: '',
      lead: '',
    });

    inform('Task added.');
  }

  function addTemplate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setTemplates((previous) => [
      {
        ...templateForm,
        id: crypto.randomUUID(),
      },
      ...previous,
    ]);

    setTemplateForm({
      name: '',
      channel: 'Email',
      subject: '',
      message: '',
    });

    inform('Template saved.');
  }

  function addMember(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMembers((previous) => [
      {
        ...memberForm,
        id: crypto.randomUUID(),
        status: 'Invited',
      },
      ...previous,
    ]);

    setMemberForm({
      name: '',
      email: '',
      role: 'Sales',
    });

    inform('Invitation created.');
  }

  const card = (title: string, body: React.ReactNode) => (
    <section className="panel" key={title}>
      <h2>{title}</h2>
      {body}
    </section>
  );

  const field = (
    label: string,
    value: string,
    onChange: (value: string) => void,
    type = 'text'
  ) => (
    <label className="pliora-field">
      {label}
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={label === 'Name' || label === 'Email'}
      />
    </label>
  );

  const stat = (label: string, value: string) => (
    <div className="stat-card" key={label}>
      <p>{label}</p>
      <h2>{value}</h2>
    </div>
  );

  if (!isLoggedIn) {
    return (
      <div className="login-page">
        <div className="login-card">
          <div className="login-brand">PLIORA</div>
          <p className="login-subtitle">GROUP</p>
          <div className="login-icon">✦</div>
          <h1>Welcome Back</h1>
          <p className="login-description">
            Sign in to your Sales & Outreach Dashboard
          </p>

          <form onSubmit={submitLogin}>
            <label>Email Address</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />

            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />

            <button className="login-button">
              Sign In
            </button>
          </form>

          <button
            className="text-button"
            onClick={() => openPage('Forgot Password')}
          >
            Forgot password?
          </button>

          <p className="login-footer">
            PLIORA Group © 2026. All rights reserved.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <h2>PLIORA</h2>
        <p>Group</p>

        <nav>
          {menuItems.map((item) => (
            <a
              href="#"
              key={item}
              className={activePage === item ? 'active' : ''}
              onClick={(event) => {
                event.preventDefault();
                openPage(item);
              }}
            >
              {item}
            </a>
          ))}
        </nav>

        <button
          className="logout-button"
          onClick={() => setIsLoggedIn(false)}
        >
          Log Out
        </button>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <h2>Sales & Outreach Dashboard</h2>
          <span>{settings.fullName || 'Admin'}</span>
        </header>

        {notice && (
          <div className="pliora-notice">
            {notice}
            <button onClick={() => setNotice('')}>×</button>
          </div>
        )}

        {activePage === 'Dashboard' && (
          <>
            <section className="welcome">
              <h1>Welcome to PLIORA</h1>
              <p>
                Manage your sales and outreach activities in one place.
              </p>
            </section>

            <section className="stats">
              {stat('Total Leads', String(leads.length))}
              {stat(
                'Open Opportunities',
                String(
                  leads.filter(
                    (lead) =>
                      !['Won', 'Lost', 'Not a Fit'].includes(lead.status)
                  ).length
                )
              )}
              {stat(
                'Tasks Pending',
                String(tasks.filter((task) => !task.completed).length)
              )}
              {stat(
                'Won Leads',
                String(leads.filter((lead) => lead.status === 'Won').length)
              )}
            </section>

            <div className="pliora-two-col">
              {card(
                'Pipeline Overview',
                <div className="pliora-list">
                  {pipelineStages.slice(0, 8).map((stage) => (
                    <div key={stage}>
                      <span>{stage}</span>
                      <strong>
                        {leads.filter((lead) => lead.status === stage).length}
                      </strong>
                    </div>
                  ))}
                </div>
              )}

              {card(
                'Recent Leads',
                <div className="pliora-list">
                  {leads.slice(0, 5).map((lead) => (
                    <div key={lead.id}>
                      <span>
                        {lead.name} · {lead.company}
                      </span>
                      <strong>{lead.status}</strong>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {card(
              'Upcoming Tasks',
              <div className="pliora-list">
                {tasks
                  .filter((task) => !task.completed)
                  .slice(0, 5)
                  .map((task) => (
                    <div key={task.id}>
                      <span>{task.title}</span>
                      <strong>{task.date || 'No date'}</strong>
                    </div>
                  ))}

                {tasks.filter((task) => !task.completed).length === 0 && (
                  <p>No pending tasks.</p>
                )}
              </div>
            )}
          </>
        )}

        {activePage === 'Leads' && (
          <section className="panel leads-panel">
            <div className="leads-heading">
              <div>
                <h1>Leads Management</h1>
                <p>View, create, edit and manage leads.</p>
              </div>

              <button
                className="add-button"
                onClick={() => {
                  setLeadForm(blankLead());
                  setEditingLeadId(null);
                  setShowLeadForm(true);
                }}
              >
                + Add New Lead
              </button>
            </div>

            <input
              className="search-input"
              placeholder="Search name, company, email or phone..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />

            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Company</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Owner</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredLeads.map((lead) => (
                    <tr key={lead.id}>
                      <td>{lead.name}</td>
                      <td>{lead.company}</td>
                      <td>{lead.email}</td>
                      <td>{lead.phone}</td>
                      <td>{lead.owner}</td>
                      <td>{lead.priority}</td>

                      <td>
                        <select
                          value={lead.status}
                          onChange={(event) =>
                            changeStatus(lead.id, event.target.value)
                          }
                        >
                          {pipelineStages.map((stage) => (
                            <option key={stage}>{stage}</option>
                          ))}
                        </select>
                      </td>

                      <td>
                        <button
                          className="view-details-button"
                          onClick={() => {
                            setSelectedLeadId(lead.id);
                            openPage('Lead Detail');
                          }}
                        >
                          View
                        </button>

                        <button
                          className="view-details-button"
                          onClick={() => editLead(lead)}
                        >
                          Edit
                        </button>

                        <button
                          className="view-details-button"
                          onClick={() => deleteLead(lead.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredLeads.length === 0 && <p>No leads found.</p>}
            </div>
          </section>
        )}

        {activePage === 'Lead Detail' && selectedLead && (
          <section className="lead-detail-page">
            <button
              className="back-button"
              onClick={() => openPage('Leads')}
            >
              ← Back to Leads
            </button>

            <div className="lead-detail-heading">
              <div>
                <p className="detail-eyebrow">LEAD PROFILE</p>
                <h1>{selectedLead.name}</h1>
                <p>{selectedLead.company}</p>
              </div>

              <span className="detail-status">
                {selectedLead.status}
              </span>
            </div>

            <div className="lead-detail-grid">
              <section className="detail-card">
                <h2>Profile Summary</h2>
                <div className="detail-info">
                  <p><strong>Email:</strong> {selectedLead.email}</p>
                  <p><strong>Phone:</strong> {selectedLead.phone}</p>
                  <p><strong>Source:</strong> {selectedLead.source}</p>
                  <p><strong>Priority:</strong> {selectedLead.priority}</p>
                  <p>
                    <strong>Created:</strong>{' '}
                    {new Date(selectedLead.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <button
                  className="view-details-button"
                  onClick={() => editLead(selectedLead)}
                >
                  Edit Lead
                </button>
              </section>

              <section className="detail-card">
                <h2>Owner & Status</h2>
                <p>{selectedLead.owner}</p>

                <select
                  value={selectedLead.status}
                  onChange={(event) =>
                    changeStatus(selectedLead.id, event.target.value)
                  }
                >
                  {pipelineStages.map((stage) => (
                    <option key={stage}>{stage}</option>
                  ))}
                </select>
              </section>

              <section className="detail-card">
                <h2>Contact Channels</h2>
                <div className="channel-list">
                  <div>
                    <span>Email</span>
                    <strong>{selectedLead.email}</strong>
                  </div>
                  <div>
                    <span>Phone</span>
                    <strong>{selectedLead.phone}</strong>
                  </div>
                  <div>
                    <span>WhatsApp</span>
                    <strong>Requires provider connection</strong>
                  </div>
                  <div>
                    <span>Instagram</span>
                    <strong>Requires provider connection</strong>
                  </div>
                </div>
              </section>

              <section className="detail-card">
                <h2>Notes</h2>

                <textarea
                  className="lead-notes-input"
                  rows={5}
                  value={selectedLead.notes}
                  onChange={(event) =>
                    setLeads((previous) =>
                      previous.map((lead) =>
                        lead.id === selectedLead.id
                          ? { ...lead, notes: event.target.value }
                          : lead
                      )
                    )
                  }
                />

                <p>Notes save automatically in this browser.</p>
              </section>

              <section className="detail-card">
                <h2>Tags</h2>
                <div className="lead-tags">
                  {selectedLead.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
              </section>

              <section className="detail-card">
                <h2>Tasks</h2>

                {tasks
                  .filter((task) => task.lead === selectedLead.id)
                  .map((task) => (
                    <div className="detail-task" key={task.id}>
                      <label>
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={() =>
                            setTasks((previous) =>
                              previous.map((item) =>
                                item.id === task.id
                                  ? { ...item, completed: !item.completed }
                                  : item
                              )
                            )
                          }
                        />
                        {task.title}
                      </label>

                      <span>{task.date}</span>
                    </div>
                  ))}

                <p>Create tasks from Task Calendar.</p>
              </section>

              <section className="detail-card">
                <h2>Activity Timeline</h2>
                <div className="activity-timeline">
                  <div>
                    <strong>Lead Created</strong>
                    <p>{selectedLead.source}</p>
                    <small>
                      {new Date(selectedLead.createdAt).toLocaleString()}
                    </small>
                  </div>

                  <div>
                    <strong>Current Status: {selectedLead.status}</strong>
                    <p>Current pipeline stage</p>
                  </div>
                </div>
              </section>

              <section className="detail-card">
                <h2>Follow-up History</h2>

                {tasks
                  .filter((task) => task.lead === selectedLead.id)
                  .map((task) => (
                    <div className="followup-item" key={task.id}>
                      <strong>{task.title}</strong>
                      <p>{task.date} {task.time}</p>
                      <span>
                        {task.completed ? 'Completed' : 'Pending'}
                      </span>
                    </div>
                  ))}
              </section>
            </div>
          </section>
        )}

        {activePage === 'Pipeline' && (
          <section className="pipeline-section">
            <div className="pipeline-heading">
              <div>
                <h1>Sales Pipeline</h1>
                <p>Drag leads between stages.</p>
              </div>

              <span className="pipeline-total">
                {leads.length} Total Leads
              </span>
            </div>

            <div className="pipeline-board">
              {pipelineStages.map((stage) => (
                <div
                  className="pipeline-column"
                  key={stage}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => dropLead(event, stage)}
                >
                  <div className="pipeline-column-heading">
                    <h3>{stage}</h3>
                    <span>
                      {leads.filter((lead) => lead.status === stage).length}
                    </span>
                  </div>

                  <div className="pipeline-cards">
                    {leads
                      .filter((lead) => lead.status === stage)
                      .map((lead) => (
                        <div
                          className={`pipeline-card ${
                            draggedEmail === lead.id ? 'dragging' : ''
                          }`}
                          key={lead.id}
                          draggable
                          onDragStart={(event) =>
                            dragStart(event, lead.id)
                          }
                          onDragEnd={() => setDraggedEmail(null)}
                        >
                          <h4>{lead.name}</h4>
                          <p className="pipeline-company">{lead.company}</p>
                          <p className="pipeline-email">{lead.email}</p>

                          <button
                            className="view-details-button"
                            onClick={() => {
                              setSelectedLeadId(lead.id);
                              openPage('Lead Detail');
                            }}
                          >
                            View Details
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {activePage === 'Campaigns' && (
          <section className="panel">
            <h1>Campaign Management</h1>
            <p>
              Create and organize outreach campaigns. Actual campaign delivery
              requires connected email or messaging providers.
            </p>

            <form
              className="pliora-form"
              onSubmit={(event) => {
                event.preventDefault();
                inform('Campaign draft saved. Provider connection is required to send.');
              }}
            >
              <label>
                Campaign Name
                <input
                  value={messageText}
                  onChange={(event) => setMessageText(event.target.value)}
                  required
                />
              </label>

              <label>
                Channel
                <select>
                  <option>Email</option>
                  <option>WhatsApp</option>
                  <option>LinkedIn</option>
                </select>
              </label>

              <button className="add-button">Save Campaign Draft</button>
            </form>
          </section>
        )}

        {activePage === 'Outreach Workspace' && (
          <section className="panel">
            <h1>Outreach Workspace</h1>
            <p>
              Prepare outreach for a selected lead. Sending requires a
              configured provider.
            </p>

            <label>
              Select Lead
              <select id="outreachLead">
                {leads.map((lead) => (
                  <option key={lead.id} value={lead.id}>
                    {lead.name} — {lead.email}
                  </option>
                ))}
              </select>
            </label>

            <textarea
              className="lead-notes-input"
              rows={6}
              placeholder="Write outreach message..."
              value={messageText}
              onChange={(event) => setMessageText(event.target.value)}
            />

            <button
              className="add-button"
              onClick={() =>
                inform('Message draft saved. It has not been sent.')
              }
            >
              Save Message Draft
            </button>
          </section>
        )}

        {activePage === 'Templates' && (
          <>
            <section className="panel">
              <h1>Message Templates</h1>

              <form className="pliora-form" onSubmit={addTemplate}>
                {field(
                  'Template name',
                  templateForm.name,
                  (value) => setTemplateForm({ ...templateForm, name: value })
                )}

                <label>
                  Channel
                  <select
                    value={templateForm.channel}
                    onChange={(event) =>
                      setTemplateForm({
                        ...templateForm,
                        channel: event.target.value,
                      })
                    }
                  >
                    <option>Email</option>
                    <option>WhatsApp</option>
                    <option>LinkedIn</option>
                  </select>
                </label>

                {field(
                  'Subject',
                  templateForm.subject,
                  (value) => setTemplateForm({ ...templateForm, subject: value })
                )}

                <label>
                  Message
                  <textarea
                    value={templateForm.message}
                    onChange={(event) =>
                      setTemplateForm({
                        ...templateForm,
                        message: event.target.value,
                      })
                    }
                    required
                    rows={4}
                  />
                </label>

                <button className="add-button">Save Template</button>
              </form>
            </section>

            <section className="panel">
              <h2>Saved Templates</h2>

              {templates.map((template) => (
                <div className="pliora-record" key={template.id}>
                  <div>
                    <strong>{template.name}</strong>
                    <p>{template.channel} · {template.subject}</p>
                    <p>{template.message}</p>
                  </div>

                  <button
                    className="view-details-button"
                    onClick={() =>
                      setTemplates((previous) =>
                        previous.filter((item) => item.id !== template.id)
                      )
                    }
                  >
                    Delete
                  </button>
                </div>
              ))}
            </section>
          </>
        )}

        {activePage === 'Unified Inbox' && (
          <section className="panel">
            <h1>Unified Inbox</h1>
            <p>
              Conversations will appear here after real provider connections
              are configured.
            </p>

            <div className="pliora-two-col">
              <div className="pliora-list">
                {leads.map((lead) => (
                  <button
                    className="pliora-conversation"
                    key={lead.id}
                    onClick={() => setActiveConversation(lead.id)}
                  >
                    {lead.name}
                    <small>{lead.email}</small>
                  </button>
                ))}
              </div>

              <div className="detail-card">
                <h2>
                  {leads.find((lead) => lead.id === activeConversation)?.name ||
                    'Select a conversation'}
                </h2>

                <p>No synced messages are available.</p>

                <textarea
                  className="lead-notes-input"
                  rows={4}
                  value={messageText}
                  onChange={(event) => setMessageText(event.target.value)}
                  placeholder="Draft a reply..."
                />

                <button
                  className="add-button"
                  onClick={() =>
                    inform('Reply draft saved. No message was sent.')
                  }
                >
                  Save Reply Draft
                </button>
              </div>
            </div>
          </section>
        )}

        {activePage === 'Follow-up Queue' && (
          <section className="panel">
            <h1>Follow-up Queue</h1>
            <p>Leads with follow-up tasks and due dates.</p>

            {tasks
              .filter((task) => !task.completed)
              .map((task) => (
                <div className="pliora-record" key={task.id}>
                  <div>
                    <strong>{task.title}</strong>
                    <p>
                      {leads.find((lead) => lead.id === task.lead)?.name ||
                        'No lead linked'}{' '}
                      · {task.date} {task.time}
                    </p>
                  </div>

                  <button
                    className="view-details-button"
                    onClick={() =>
                      setTasks((previous) =>
                        previous.map((item) =>
                          item.id === task.id
                            ? { ...item, completed: true }
                            : item
                        )
                      )
                    }
                  >
                    Mark Done
                  </button>
                </div>
              ))}

            {tasks.filter((task) => !task.completed).length === 0 && (
              <p>No pending follow-ups.</p>
            )}
          </section>
        )}

        {activePage === 'Task Calendar' && (
          <>
            <section className="panel">
              <h1>Task Calendar</h1>

              <form className="pliora-form" onSubmit={addTask}>
                {field(
                  'Task title',
                  taskForm.title,
                  (value) => setTaskForm({ ...taskForm, title: value })
                )}

                <label>
                  Due date
                  <input
                    type="date"
                    value={taskForm.date}
                    onChange={(event) =>
                      setTaskForm({ ...taskForm, date: event.target.value })
                    }
                    required
                  />
                </label>

                <label>
                  Time
                  <input
                    type="time"
                    value={taskForm.time}
                    onChange={(event) =>
                      setTaskForm({ ...taskForm, time: event.target.value })
                    }
                  />
                </label>

                <label>
                  Related Lead
                  <select
                    value={taskForm.lead}
                    onChange={(event) =>
                      setTaskForm({ ...taskForm, lead: event.target.value })
                    }
                  >
                    <option value="">No lead</option>
                    {leads.map((lead) => (
                      <option value={lead.id} key={lead.id}>
                        {lead.name}
                      </option>
                    ))}
                  </select>
                </label>

                <button className="add-button">Create Task</button>
              </form>
            </section>

            <section className="panel">
              <h2>All Tasks</h2>

              {tasks.map((task) => (
                <div className="pliora-record" key={task.id}>
                  <label>
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() =>
                        setTasks((previous) =>
                          previous.map((item) =>
                            item.id === task.id
                              ? { ...item, completed: !item.completed }
                              : item
                          )
                        )
                      }
                    />
                    {task.title}
                  </label>

                  <span>{task.date} {task.time}</span>

                  <button
                    className="view-details-button"
                    onClick={() =>
                      setTasks((previous) =>
                        previous.filter((item) => item.id !== task.id)
                      )
                    }
                  >
                    Delete
                  </button>
                </div>
              ))}
            </section>
          </>
        )}

        {activePage === 'Team Directory' && (
          <>
            <section className="panel">
              <h1>Team Directory</h1>

              <form className="pliora-form" onSubmit={addMember}>
                {field(
                  'Name',
                  memberForm.name,
                  (value) => setMemberForm({ ...memberForm, name: value })
                )}

                {field(
                  'Email',
                  memberForm.email,
                  (value) => setMemberForm({ ...memberForm, email: value }),
                  'email'
                )}

                <label>
                  Role
                  <select
                    value={memberForm.role}
                    onChange={(event) =>
                      setMemberForm({ ...memberForm, role: event.target.value })
                    }
                  >
                    <option>Sales</option>
                    <option>Manager</option>
                    <option>Administrator</option>
                    <option>Viewer</option>
                  </select>
                </label>

                <button className="add-button">Invite Team Member</button>
              </form>
            </section>

            <section className="panel">
              <h2>Members</h2>

              {members.map((member) => (
                <div className="pliora-record" key={member.id}>
                  <div>
                    <strong>{member.name}</strong>
                    <p>
                      {member.email} · {member.role} · {member.status}
                    </p>
                  </div>

                  <button
                    className="view-details-button"
                    onClick={() =>
                      setMembers((previous) =>
                        previous.filter((item) => item.id !== member.id)
                      )
                    }
                  >
                    Remove
                  </button>
                </div>
              ))}
            </section>
          </>
        )}

        {(activePage === 'Analytics' || activePage === 'Reports') && (
          <>
            <section className="stats">
              {stat('Total Leads', String(leads.length))}
              {stat(
                'Contacted',
                String(leads.filter((lead) => lead.status === 'Contacted').length)
              )}
              {stat(
                'Interested',
                String(leads.filter((lead) => lead.status === 'Interested').length)
              )}
              {stat(
                'Won',
                String(leads.filter((lead) => lead.status === 'Won').length)
              )}
            </section>

            <section className="panel">
              <h1>{activePage}</h1>
              <h2>Lead Status Breakdown</h2>

              {pipelineStages.map((stage) => (
                <div className="pliora-bar-row" key={stage}>
                  <span>{stage}</span>

                  <div className="pliora-bar">
                    <i
                      style={{
                        width: `${
                          leads.length
                            ? (leads.filter((lead) => lead.status === stage).length /
                                leads.length) *
                              100
                            : 0
                        }%`,
                      }}
                    />
                  </div>

                  <strong>
                    {leads.filter((lead) => lead.status === stage).length}
                  </strong>
                </div>
              ))}

              <button
                className="add-button"
                onClick={() => {
                  const csv = [
                    'Name,Company,Email,Phone,Status,Owner,Priority',
                    ...leads.map((lead) =>
                      [
                        lead.name,
                        lead.company,
                        lead.email,
                        lead.phone,
                        lead.status,
                        lead.owner,
                        lead.priority,
                      ]
                        .map((value) => `"${value.replaceAll('"', '""')}"`)
                        .join(',')
                    ),
                  ].join('\n');

                  const url = URL.createObjectURL(
                    new Blob([csv], { type: 'text/csv' })
                  );

                  const link = document.createElement('a');
                  link.href = url;
                  link.download = 'pliora-leads-report.csv';
                  link.click();

                  URL.revokeObjectURL(url);
                }}
              >
                Export Leads CSV
              </button>
            </section>
          </>
        )}

        {activePage === 'Integrations Overview' && (
          <section className="panel">
            <h1>Integrations</h1>
            <p>
              Connect external services through their official APIs and OAuth
              flows. These connections are not configured in this frontend.
            </p>

            {[
              'Email Provider',
              'WhatsApp Business API',
              'Instagram Business',
              'LinkedIn',
              'Calendar',
              'CRM / Webhooks',
            ].map((provider) => (
              <div className="pliora-record" key={provider}>
                <div>
                  <strong>{provider}</strong>
                  <p>Not connected</p>
                </div>

                <button
                  className="view-details-button"
                  onClick={() => {
                    setSetupStep(1);
                    openPage('Integration Setup Wizard');
                  }}
                >
                  Configure
                </button>
              </div>
            ))}
          </section>
        )}

        {activePage === 'Integration Setup Wizard' && (
          <section className="panel">
            <h1>Integration Setup Wizard</h1>
            <p>Step {setupStep} of 3</p>

            {setupStep === 1 && (
              <>
                <h2>Select provider</h2>
                <select>
                  <option>Email provider</option>
                  <option>WhatsApp Business API</option>
                  <option>Instagram Business</option>
                  <option>LinkedIn</option>
                </select>
              </>
            )}

            {setupStep === 2 && (
              <>
                <h2>Provider credentials</h2>
                <p>
                  Credentials must be entered and securely stored by a backend
                  service. Do not paste secret keys into this frontend.
                </p>
              </>
            )}

            {setupStep === 3 && (
              <>
                <h2>Review</h2>
                <p>
                  Backend OAuth, callback URL and webhook verification are
                  required to activate this integration.
                </p>
              </>
            )}

            <div className="modal-actions">
              <button
                className="cancel-button"
                onClick={() => setSetupStep(Math.max(1, setupStep - 1))}
              >
                Back
              </button>

              <button
                className="add-button"
                onClick={() =>
                  setupStep < 3
                    ? setSetupStep(setupStep + 1)
                    : inform('Setup requirements reviewed. Backend implementation is required.')
                }
              >
                {setupStep === 3 ? 'Finish' : 'Continue'}
              </button>
            </div>
          </section>
        )}

        {activePage === 'Settings' && (
          <section className="panel">
            <h1>Profile Settings</h1>

            <form
              className="pliora-form"
              onSubmit={(event) => {
                event.preventDefault();
                inform('Profile settings saved.');
              }}
            >
              {field(
                'Full name',
                settings.fullName || '',
                (value) => setSettings({ ...settings, fullName: value })
              )}

              {field(
                'Organization',
                settings.organization || '',
                (value) => setSettings({ ...settings, organization: value })
              )}

              {field(
                'Phone',
                settings.phone || '',
                (value) => setSettings({ ...settings, phone: value })
              )}

              {field(
                'Website',
                settings.website || '',
                (value) => setSettings({ ...settings, website: value })
              )}

              <button className="add-button">Save Profile</button>
            </form>

            <h2>Organization Settings</h2>
            <p>Organization: {settings.organization}</p>

            <h2>Roles & Permissions</h2>
            <p>
              Administrator: full access · Manager: manage leads and tasks ·
              Sales: manage assigned leads · Viewer: read-only
            </p>

            <h2>Security Settings</h2>
            <p>
              Production password policy, MFA and session controls require
              backend authentication.
            </p>
          </section>
        )}

        {activePage === 'Notifications' && (
          <section className="panel">
            <h1>Notifications</h1>

            {notifications.map((message, index) => (
              <div className="pliora-record" key={`${message}-${index}`}>
                {message}
              </div>
            ))}

            {notifications.length === 0 && <p>No notifications yet.</p>}

            <button
              className="view-details-button"
              onClick={() => setNotifications([])}
            >
              Clear notifications
            </button>
          </section>
        )}

        {activePage === 'Audit Log' && (
          <section className="panel">
            <h1>Audit Log</h1>
            <p>
              Local browser activity is not a secure audit trail. Production
              audit events must be recorded by the backend.
            </p>

            {notifications.map((message, index) => (
              <div className="pliora-record" key={`${message}-${index}`}>
                {message}
              </div>
            ))}
          </section>
        )}

        {activePage === 'Forgot Password' && (
          <section className="panel">
            <h1>Forgot Password</h1>
            <p>
              Enter your account email. A real reset email requires backend
              email delivery.
            </p>

            <form
              className="pliora-form"
              onSubmit={(event) => {
                event.preventDefault();
                inform('Password reset flow needs backend email verification.');
              }}
            >
              <label>
                Email
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(event) => setResetEmail(event.target.value)}
                  required
                />
              </label>

              <button className="add-button">Request Reset Link</button>

              <button
                type="button"
                className="view-details-button"
                onClick={() => openPage('Dashboard')}
              >
                Back
              </button>
            </form>
          </section>
        )}

        {activePage === 'Reset Password' && (
          <section className="panel">
            <h1>Reset Password</h1>
            <p>
              A secure, expiring reset token must be validated by the backend
              before changing a password.
            </p>
          </section>
        )}

        {activePage === 'Invitation/Set Password' && (
          <section className="panel">
            <h1>Invitation / Set Password</h1>
            <p>
              Invitation tokens and password creation require backend
              verification.
            </p>
          </section>
        )}

        {activePage === 'Access Denied' && (
          <section className="panel">
            <h1>Access Denied</h1>
            <p>You do not have permission to access this resource.</p>

            <button
              className="add-button"
              onClick={() => openPage('Dashboard')}
            >
              Return to Dashboard
            </button>
          </section>
        )}

        {activePage === '404' && (
          <section className="panel">
            <h1>404 — Page Not Found</h1>

            <button
              className="add-button"
              onClick={() => openPage('Dashboard')}
            >
              Return to Dashboard
            </button>
          </section>
        )}
      </main>

      {showLeadForm && (
        <div className="modal-overlay">
          <div className="lead-modal">
            <h2>{editingLeadId ? 'Edit Lead' : 'Add New Lead'}</h2>

            <form onSubmit={saveLead}>
              {field(
                'Name',
                leadForm.name,
                (value) => setLeadForm({ ...leadForm, name: value })
              )}

              {field(
                'Company',
                leadForm.company,
                (value) => setLeadForm({ ...leadForm, company: value })
              )}

              {field(
                'Email',
                leadForm.email,
                (value) => setLeadForm({ ...leadForm, email: value }),
                'email'
              )}

              {field(
                'Phone',
                leadForm.phone,
                (value) => setLeadForm({ ...leadForm, phone: value })
              )}

              <label>
                Status
                <select
                  value={leadForm.status}
                  onChange={(event) =>
                    setLeadForm({ ...leadForm, status: event.target.value })
                  }
                >
                  {pipelineStages.map((stage) => (
                    <option key={stage}>{stage}</option>
                  ))}
                </select>
              </label>

              <label>
                Owner
                <input
                  value={leadForm.owner}
                  onChange={(event) =>
                    setLeadForm({ ...leadForm, owner: event.target.value })
                  }
                />
              </label>

              <label>
                Source
                <input
                  value={leadForm.source}
                  onChange={(event) =>
                    setLeadForm({ ...leadForm, source: event.target.value })
                  }
                />
              </label>

              <label>
                Priority
                <select
                  value={leadForm.priority}
                  onChange={(event) =>
                    setLeadForm({ ...leadForm, priority: event.target.value })
                  }
                >
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              </label>

              <label>
                Notes
                <textarea
                  rows={3}
                  value={leadForm.notes}
                  onChange={(event) =>
                    setLeadForm({ ...leadForm, notes: event.target.value })
                  }
                />
              </label>

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => setShowLeadForm(false)}
                >
                  Cancel
                </button>

                <button className="add-button">
                  Save Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}