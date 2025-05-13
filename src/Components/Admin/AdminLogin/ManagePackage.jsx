import React, { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs, doc, updateDoc, addDoc, deleteDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import './ManagePackage.css';
import Sidebar from '../../../Components/Global/Sidebar';

function ManagePackage() {
  const [services, setServices] = useState([]);
  const [editingService, setEditingService] = useState(null);
  const [editingComponent, setEditingComponent] = useState(null);
  const [newService, setNewService] = useState({
    name: '',
    withoutPH: 0,
    PHBenefit: 0,
    withPH: 0,
    description: '',
    isPackage: false,
    components: []
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [newComponent, setNewComponent] = useState({
    name: '',
    withoutPH: 0,
    PHBenefit: 0,
    withPH: 0
  });
  const [activeTab, setActiveTab] = useState('package');

  const defaultComponents = [
    {
      name: "Delivery Room",
      withoutPH: 0,
      PHBenefit: 0,
      withPH: 0
    },
    {
      name: "Room Rate",
      withoutPH: 0,
      PHBenefit: 0,
      withPH: 0
    },
    {
      name: "Drugs, Meds & Supplies",
      withoutPH: 0,
      PHBenefit: 0,
      withPH:0
    },
    {
      name: "Assist Fee",
      withoutPH: 0,
      PHBenefit: 0,
      withPH: 0
    },
    {
      name: "Professional Fee",
      withoutPH: 0,
      PHBenefit: 0,
      withPH: 0
    }
  ];

  const firestore = getFirestore();

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const servicesRef = collection(firestore, 'services');
      const snapshot = await getDocs(servicesRef);
      const servicesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setServices(servicesData);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast.error('Failed to fetch services');
    }
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setNewService(service);
    setShowAddForm(true);
  };

  const handleDelete = async (service) => {
    const isPackage = service.isPackage;
    const message = isPackage 
      ? `Are you sure you want to delete the package "${service.name}"`
      : `Are you sure you want to delete the service "${service.name}"? This action cannot be undone.`;

    if (window.confirm(message)) {
      try {
        const appointmentsRef = collection(firestore, 'appointments');
        const appointmentsSnapshot = await getDocs(appointmentsRef);
        const isUsed = appointmentsSnapshot.docs.some(doc => {
          const appointment = doc.data();
          return appointment.services.some(s => s.id === service.id);
        });

        if (isUsed) {
          toast.error(`Cannot delete ${isPackage ? 'package' : 'service'} as it is being used in existing appointments`);
          return;
        }
        await deleteDoc(doc(firestore, 'services', service.id));

        if (isPackage) {

        }

        toast.success(`${isPackage ? 'Package' : 'Service'} "${service.name}" deleted successfully`);
        fetchServices();
      } catch (error) {
        console.error('Error deleting service:', error);
        toast.error(`Failed to delete ${isPackage ? 'package' : 'service'}. Please try again.`);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingService) {
        await updateDoc(doc(firestore, 'services', editingService.id), newService);
        toast.success('Service updated successfully');
      } else {
        await addDoc(collection(firestore, 'services'), newService);
        toast.success('Service added successfully');
      }
      setShowAddForm(false);
      setEditingService(null);
      setNewService({
        name: '',
        withoutPH: 0,
        PHBenefit: 0,
        withPH: 0,
        description: '',
        isPackage: false,
        components: []
      });
      fetchServices();
    } catch (error) {
      console.error('Error saving service:', error);
      toast.error('Failed to save service');
    }
  };

  const handleAddComponent = () => {
    if (newComponent.name && newComponent.withoutPH && newComponent.PHBenefit && newComponent.withPH) {
      setNewService(prev => ({
        ...prev,
        components: [...prev.components, newComponent]
      }));
      setNewComponent({
        name: '',
        withoutPH: 0,
        PHBenefit: 0,
        withPH: 0
      });
    }
  };

  const handleRemoveComponent = (index) => {
    setNewService(prev => ({
      ...prev,
      components: prev.components.filter((_, i) => i !== index)
    }));
  };

  const handleEditComponent = (component, index) => {
    setEditingComponent({ ...component, index });
    setNewComponent(component);
  };

  const handleUpdateComponent = () => {
    if (editingComponent !== null) {
      const updatedComponents = [...newService.components];
      updatedComponents[editingComponent.index] = newComponent;
      setNewService(prev => ({
        ...prev,
        components: updatedComponents
      }));
      setEditingComponent(null);
      setNewComponent({
        name: '',
        withoutPH: 0,
        PHBenefit: 0,
        withPH: 0
      });
    }
  };

  const handlePackageToggle = (e) => {
    const isPackage = e.target.checked;
    setNewService(prev => ({
      ...prev,
      isPackage,
      components: isPackage ? [...defaultComponents] : []
    }));
  };

const filteredServices = services.filter(service => {
  if (activeTab === 'packages') return service.isPackage;
  if (activeTab === 'services') return !service.isPackage;
  return false;
});


  return (
    <div className="add-manage-package-container">
            <Sidebar isAdmin={true} />
      <div className="add-package-header">
        <h2>Manage Services and Packages</h2>
        <p>Add, edit, or remove services and packages for your appointments</p>
      </div>

      <div className="add-package-tabs">
        <button 
          className={`add-tab-btn ${activeTab === 'packages' ? 'active' : ''}`}
          onClick={() => setActiveTab('packages')}
        >
          Packages
        </button>
        <button 
          className={`add-tab-btn ${activeTab === 'services' ? 'active' : ''}`}
          onClick={() => setActiveTab('services')}
        >
          Individual Services
        </button>
      </div>

      <div className="add-service-btn-container">
        <button 
          className="add-service-btn"
          onClick={() => {
            setShowAddForm(true);
            setEditingService(null);
            setNewService({
              name: '',
              withoutPH: 0,
              PHBenefit: 0,
              withPH: 0,
              description: '',
              isPackage: false,
              components: []
            });
          }}
        >
          <FaPlus /> Add New Service/Package
        </button>
      </div>

      {showAddForm && (
        <div className="add-service-modal">
          <div className="add-modal-content">
            <div className="add-modal-header">
              <h3>{editingService ? 'Edit Service' : 'Add New Service'}</h3>
              <button className="add-close-btn" onClick={() => setShowAddForm(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit} className="add-service-form">
              <div className="add-form-group">
                <label>Name</label>
                <input
                  type="text"
                  className="add-form-control"
                  value={newService.name}
                  onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                  required
                />
              </div>

              <div className="add-form-group">
                <label>Description</label>
                <textarea
                  className="add-form-control"
                  value={newService.description}
                  onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                  required
                />
              </div>

              <div className="add-price-inputs">
                <div className="add-form-group">
                  <label>Without PhilHealth Price</label>
                  <input
                    type="number"
                    className="add-form-control"
                    value={newService.withoutPH}
                    onChange={(e) => setNewService({ ...newService, withoutPH: Number(e.target.value) })}
                    required
                  />
                </div>

                <div className="add-form-group">
                  <label>PhilHealth Benefit</label>
                  <input
                    type="number"
                    className="add-form-control"
                    value={newService.PHBenefit}
                    onChange={(e) => setNewService({ ...newService, PHBenefit: Number(e.target.value) })}
                    required
                  />
                </div>

                <div className="add-form-group">
                  <label>With PhilHealth Price</label>
                  <input
                    type="number"
                    className="add-form-control"
                    value={newService.withPH}
                    onChange={(e) => setNewService({ ...newService, withPH: Number(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div className="add-form-group add-package-toggle">
                <label className="add-checkbox-label">
                  <input
                    type="checkbox"
                    checked={newService.isPackage}
                    onChange={handlePackageToggle}
                  />
                  <span>Is Package</span>
                </label>
              </div>

              {newService.isPackage && (
                <div className="add-components-section">
                  <h4>Package Components</h4>
                  <div className="add-components-list">
                    {newService.components.map((component, index) => (
                      <div key={index} className="add-component-item">
                        <div className="add-component-info">
                          <span className="add-component-name">{component.name}</span>
                          <div className="add-component-prices">
                            <span>Without PH: ₱{component.withoutPH.toLocaleString()}</span>
                            <span>PH Benefit: ₱{component.PHBenefit.toLocaleString()}</span>
                            <span>With PH: ₱{component.withPH.toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="add-component-actions">
                          <button
                            type="button"
                            className="add-edit-component-btn"
                            onClick={() => handleEditComponent(component, index)}
                          >
                            <FaEdit />
                          </button>
                          <button
                            type="button"
                            className="add-remove-component-btn"
                            onClick={() => handleRemoveComponent(index)}
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {editingComponent !== null ? (
                    <div className="add-edit-component-form">
                      <h5>Edit Component</h5>
                      <div className="add-form-group">
                        <label>Package Name</label>
                        <input
                          type="text"
                          className="add-form-control"
                          value={newComponent.name}
                          onChange={(e) => setNewComponent({ ...newComponent, name: e.target.value })}
                        />
                      </div>
                      <div className="add-form-group">
                        <label>Without PH Price</label>
                        <input
                          type="number"
                          className="add-form-control"
                          value={newComponent.withoutPH}
                          onChange={(e) => setNewComponent({ ...newComponent, withoutPH: Number(e.target.value) })}
                        />
                      </div>
                      <div className="add-form-group">
                        <label>PH Benefit</label>
                        <input
                          type="number"
                          className="add-form-control"
                          value={newComponent.PHBenefit}
                          onChange={(e) => setNewComponent({ ...newComponent, PHBenefit: Number(e.target.value) })}
                        />
                      </div>
                      <div className="add-form-group">
                        <label>With PH Price</label>
                        <input
                          type="number"
                          className="add-form-control"
                          value={newComponent.withPH}
                          onChange={(e) => setNewComponent({ ...newComponent, withPH: Number(e.target.value) })}
                        />
                      </div>
                      <div className="add-form-actions">
                        <button
                          type="button"
                          className="add-submit-btn"
                          onClick={handleUpdateComponent}
                        >
                          Update Component
                        </button>
                        <button
                          type="button"
                          className="add-cancel-btn"
                          onClick={() => setEditingComponent(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="add-component-form">
                      <h5>Add New Component</h5>
                      <input
                        type="text"
                        className="add-form-control"
                        placeholder="Package Name"
                        value={newComponent.name}
                        onChange={(e) => setNewComponent({ ...newComponent, name: e.target.value })}
                      />
                      <input
                        type="number"
                        className="add-form-control"
                        placeholder="Without PH Price"
                        value={newComponent.withoutPH}
                        onChange={(e) => setNewComponent({ ...newComponent, withoutPH: Number(e.target.value) })}
                      />
                      <input
                        type="number"
                        className="add-form-control"
                        placeholder="PH Benefit"
                        value={newComponent.PHBenefit}
                        onChange={(e) => setNewComponent({ ...newComponent, PHBenefit: Number(e.target.value) })}
                      />
                      <input
                        type="number"
                        className="add-form-control"
                        placeholder="With PH Price"
                        value={newComponent.withPH}
                        onChange={(e) => setNewComponent({ ...newComponent, withPH: Number(e.target.value) })}
                      />
                      <button
                        type="button"
                        className="add-component-btn"
                        onClick={handleAddComponent}
                      >
                        Add 
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="add-form-actions">
                <button type="submit" className="add-submit-btn">
                  {editingService ? 'Update' : 'Add'} Service
                </button>
                <button
                  type="button"
                  className="add-cancel-btn"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="add-services-grid">
        {filteredServices.map((service) => (
          <div key={service.id} className={`add-service-card ${service.isPackage ? 'add-package' : 'add-individual'}`}>
            <div className="add-service-header">
              <h3>{service.name}</h3>
              <div className="add-service-type-badge">
                {service.isPackage ? 'Package' : 'Service'}
              </div>
            </div>
            
            <div className="add-service-description">
              <p>{service.description}</p>
            </div>

            <div className="add-service-prices">
              <div className="add-price-item">
                <span className="add-price-label">Without PhilHealth:</span>
                <span className="add-price-amount">₱{service.withoutPH.toLocaleString()}</span>
              </div>
              <div className="add-price-item">
                <span className="add-price-label">PhilHealth Benefit:</span>
                <span className="add-price-amount">₱{service.PHBenefit.toLocaleString()}</span>
              </div>
              <div className="add-price-item">
                <span className="add-price-label">With PhilHealth:</span>
                <span className="add-price-amount">₱{service.withPH.toLocaleString()}</span>
              </div>
            </div>

            {service.isPackage && service.components && (
              <div className="add-package-components">
                <h4>Package Components:</h4>
                <ul>
                  {service.components.map((component, index) => (
                    <li key={index}>
                      <span className="add-component-name">{component.name}</span>
                      <div className="add-component-prices">
                        <span>₱{component.withoutPH.toLocaleString()}</span>
                        <span>₱{component.PHBenefit.toLocaleString()}</span>
                        <span>₱{component.withPH.toLocaleString()}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="add-service-actions">
              <button
                className="add-edit-btn"
                onClick={() => handleEdit(service)}
              >
                <FaEdit /> Edit
              </button>
              <button
                className="add-delete-btn"
                onClick={() => handleDelete(service)}
              >
                <FaTrash /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ManagePackage;