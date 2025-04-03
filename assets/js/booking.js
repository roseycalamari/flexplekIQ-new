/**
 * FlexPlek IQ - Room Booking System
 * Handles the room booking functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    initBookingSystem();
});

/**
 * Initialize the room booking system
 */
function initBookingSystem() {
    // Log initialization for debugging
    console.log('Initializing booking system...');
    
    const datePicker = document.getElementById('bookingDate');
    const bookingModal = document.getElementById('bookingModal');
    const modalClose = document.querySelector('.booking-modal__close');
    const paymentButton = document.getElementById('paymentButton');
    const membershipCheck = document.getElementById('membershipCheck');
    
    // Room availability containers
    const room1Availability = document.getElementById('room1Availability');
    const room2Availability = document.getElementById('room2Availability');
    const room3Availability = document.getElementById('room3Availability');
    const room4Availability = document.getElementById('room4Availability');
    
    // Modal content elements
    const modalRoomName = document.getElementById('modalRoomName');
    const modalDate = document.getElementById('modalDate');
    const modalTime = document.getElementById('modalTime');
    const modalPrice = document.getElementById('modalPrice') || { dataset: {} }; // Fallback if element doesn't exist
    const modalHours = document.getElementById('modalHours');
    const modalTotalPrice = document.getElementById('modalTotalPrice');
    const modalStandardPrice = document.getElementById('modalStandardPrice');
    const modalMemberPrice = document.getElementById('modalMemberPrice');
    
    // Member verification elements
    const memberCodeContainer = document.getElementById('memberCodeContainer');
    const memberCodeInput = document.getElementById('memberCodeInput');
    const verifyCodeButton = document.getElementById('verifyCodeButton');
    const memberCodeStatus = document.getElementById('memberCodeStatus');
    
    // Variables for multi-hour selection
    let selectedTimeSlots = [];
    let currentRoomSelection = {
        roomName: '',
        date: '',
        price: 0,
        availableSlots: []
    };
    
    // Valid member codes (in a real app, this would be verified against a database)
    const validMemberCodes = ['MEMBER2024', 'FLEX123', 'IQ2024'];
    
    // Initialize date picker with today's date
    if (datePicker) {
        const today = new Date();
        const formattedDate = formatDate(today);
        datePicker.value = formattedDate;
        datePicker.min = formattedDate; // Prevent selecting past dates
        
        // Generate time slots for the selected date
        generateTimeSlots();
        
        // Update time slots when date changes
        datePicker.addEventListener('change', generateTimeSlots);
    }
    
    // Modal functionality
    if (bookingModal && modalClose) {
        // Close modal when clicking the close button
        modalClose.addEventListener('click', function() {
            bookingModal.classList.remove('active');
            resetTimeSlotSelection();
        });
        
        // Close modal when clicking outside the content
        bookingModal.addEventListener('click', function(e) {
            if (e.target === bookingModal) {
                bookingModal.classList.remove('active');
                resetTimeSlotSelection();
            }
        });
        
        // Update price when membership checkbox changes
        if (membershipCheck) {
            membershipCheck.addEventListener('change', function() {
                // Reset member code verification when checkbox changes
                if (memberCodeContainer && this.checked) {
                    // If checkbox is checked, hide the member code input
                    memberCodeContainer.style.display = 'none';
                } else {
                    // If checkbox is unchecked, show the member code input
                    memberCodeContainer.style.display = 'block';
                    
                    // Reset verification status
                    memberCodeContainer.classList.remove('verified');
                    memberCodeContainer.classList.remove('error');
                    memberCodeStatus.textContent = '';
                    memberCodeInput.value = '';
                    memberCodeInput.disabled = false;
                    verifyCodeButton.disabled = false;
                }
                
                updateModalPrice();
            });
        }
        
        // Handle member code verification
        if (memberCodeInput && verifyCodeButton) {
            verifyCodeButton.addEventListener('click', function() {
                verifyMemberCode();
            });
            
            // Also verify when pressing Enter in the input field
            memberCodeInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    verifyMemberCode();
                }
            });
        }
        
        // Handle payment button click
        if (paymentButton) {
            paymentButton.addEventListener('click', function() {
                // In a real implementation, this would integrate with Stripe
                const isMemberVerified = memberCodeContainer.classList.contains('verified');
                const isMemberCheckboxChecked = membershipCheck.checked;
                const totalPrice = parseFloat(modalTotalPrice.dataset.totalPrice);
                const totalHours = parseInt(modalHours.dataset.hours);
                const roomName = modalRoomName.textContent;
                const dateText = modalDate.textContent;
                
                let paymentMessage = `Processing payment via Stripe:\n`;
                paymentMessage += `- Room: ${roomName}\n`;
                paymentMessage += `- Date: ${dateText}\n`;
                paymentMessage += `- Time: ${formatTimeRange(selectedTimeSlots)}\n`;
                paymentMessage += `- Hours: ${totalHours}\n`;
                paymentMessage += `- Total: €${totalPrice.toFixed(2)}\n`;
                paymentMessage += `- Member pricing applied: ${(isMemberVerified || isMemberCheckboxChecked) ? 'Yes' : 'No'}`;
                
                alert(paymentMessage);
                bookingModal.classList.remove('active');
                resetTimeSlotSelection();
            });
        }
    }
    
    /**
     * Generate time slots for all rooms based on the selected date
     */
    function generateTimeSlots() {
        if (!room1Availability || !room2Availability || !room3Availability || !room4Availability) {
            return;
        }
        
        // Clear existing time slots
        room1Availability.innerHTML = '';
        room2Availability.innerHTML = '';
        room3Availability.innerHTML = '';
        room4Availability.innerHTML = '';
        
        // Get selected date
        const selectedDate = new Date(datePicker.value);
        const dayOfWeek = selectedDate.getDay();
        
        // Check if selected date is a weekend (0 = Sunday, 6 = Saturday)
        if (dayOfWeek === 0 || dayOfWeek === 6) {
            const weekendMessage = document.createElement('p');
            weekendMessage.textContent = 'No rooms available on weekends';
            weekendMessage.className = 'availability-message';
            
            room1Availability.appendChild(weekendMessage.cloneNode(true));
            room2Availability.appendChild(weekendMessage.cloneNode(true));
            room3Availability.appendChild(weekendMessage.cloneNode(true));
            room4Availability.appendChild(weekendMessage.cloneNode(true));
            
            return;
        }
        
        // Define available time slots (8:00 - 20:00)
        const timeSlots = [
            '8:00', '9:00', '10:00', '11:00', '12:00', '13:00',
            '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'
        ];
        
        // Define "booked" time slots for demo purposes
        // In a real implementation, this would come from a database
        const bookedSlots = {
            'room1': generateRandomBookedSlots(timeSlots, 3),
            'room2': generateRandomBookedSlots(timeSlots, 2),
            'room3': generateRandomBookedSlots(timeSlots, 4),
            'room4': generateRandomBookedSlots(timeSlots, 5)
        };
        
        // Generate time slots for each room
        generateRoomTimeSlots(room1Availability, timeSlots, bookedSlots.room1, 'Small Meeting Room 1', 12.50);
        generateRoomTimeSlots(room2Availability, timeSlots, bookedSlots.room2, 'Small Meeting Room 2', 12.50);
        generateRoomTimeSlots(room3Availability, timeSlots, bookedSlots.room3, 'Small Meeting Room 3', 12.50);
        generateRoomTimeSlots(room4Availability, timeSlots, bookedSlots.room4, 'Large Meeting Room', 19.50);
    }
    
    /**
     * Generate time slots for a specific room
     * 
     * @param {HTMLElement} container - The container for the time slots
     * @param {Array} timeSlots - Array of time slot strings
     * @param {Array} bookedSlots - Array of booked time slot strings
     * @param {string} roomName - Name of the room
     * @param {number} price - Price per hour
     */
    function generateRoomTimeSlots(container, timeSlots, bookedSlots, roomName, price) {
        // Create a wrapper for the room
        const roomWrapper = document.createElement('div');
        roomWrapper.className = 'room-wrapper';
        roomWrapper.dataset.roomName = roomName;
        roomWrapper.dataset.price = price;
        
        // Get available slots (not booked)
        const availableSlots = timeSlots.filter(slot => !bookedSlots.includes(slot));
        
        timeSlots.forEach(timeSlot => {
            const isBooked = bookedSlots.includes(timeSlot);
            const timeSlotElement = document.createElement('div');
            
            timeSlotElement.className = isBooked ? 'time-slot time-slot--booked' : 'time-slot';
            timeSlotElement.textContent = timeSlot;
            timeSlotElement.dataset.time = timeSlot;
            
            if (!isBooked) {
                timeSlotElement.addEventListener('click', function() {
                    handleTimeSlotSelection(timeSlotElement, roomName, datePicker.value, price, availableSlots);
                });
            }
            
            roomWrapper.appendChild(timeSlotElement);
        });
        
        // Add a booking button below the time slots
        const bookButton = document.createElement('button');
        bookButton.className = 'btn btn--primary room-book-btn';
        bookButton.textContent = 'Book Selected Times';
        bookButton.style.display = 'none'; // Hide by default
        bookButton.onclick = function(e) {
            e.preventDefault(); // Prevent any default behavior
            console.log('Book button clicked for', roomName, 'with', selectedTimeSlots.length, 'slots');
            
            if (selectedTimeSlots.length > 0) {
                openBookingModal(roomName, datePicker.value, selectedTimeSlots, price);
            }
        };
        
        roomWrapper.appendChild(bookButton);
        container.appendChild(roomWrapper);
    }
    
    /**
     * Handle time slot selection for multi-hour booking
     * 
     * @param {HTMLElement} timeSlotElement - The clicked time slot element
     * @param {string} roomName - Name of the room
     * @param {string} date - Selected date string
     * @param {number} price - Price per hour
     * @param {Array} availableSlots - Array of available time slots
     */
    function handleTimeSlotSelection(timeSlotElement, roomName, date, price, availableSlots) {
        console.log('Time slot selected:', timeSlotElement.dataset.time, 'for room:', roomName);
        
        // If this is the first selection or a different room/date was previously selected
        if (currentRoomSelection.roomName !== roomName || currentRoomSelection.date !== date) {
            // Reset previous selections
            resetTimeSlotSelection();
            
            // Set current room selection
            currentRoomSelection = {
                roomName: roomName,
                date: date,
                price: price,
                availableSlots: availableSlots
            };
            
            console.log('Set new current room selection:', currentRoomSelection);
        }
        
        const time = timeSlotElement.dataset.time;
        const timeIndex = selectedTimeSlots.indexOf(time);
        
        // If time slot is already selected, deselect it
        if (timeIndex !== -1) {
            selectedTimeSlots.splice(timeIndex, 1);
            timeSlotElement.classList.remove('time-slot--selected');
            console.log('Deselected time slot:', time);
        } else {
            // Add time slot to selection
            selectedTimeSlots.push(time);
            timeSlotElement.classList.add('time-slot--selected');
            console.log('Selected time slot:', time);
        }
        
        // Sort selected time slots chronologically
        selectedTimeSlots.sort();
        console.log('Current selected time slots:', selectedTimeSlots);
        
        // Check if the slots are consecutive
        const isConsecutive = areConsecutiveTimeSlots(selectedTimeSlots);
        
        // Get the book button for this room
        const roomWrapper = timeSlotElement.parentElement;
        if (!roomWrapper) {
            console.error('Room wrapper not found for time slot element');
            return;
        }
        
        const bookButton = roomWrapper.querySelector('.room-book-btn');
        if (!bookButton) {
            console.error('Book button not found in room wrapper');
            return;
        }
        
        // Update button visibility and state
        if (selectedTimeSlots.length > 0 && isConsecutive) {
            bookButton.style.display = 'block';
            bookButton.disabled = false;
            bookButton.textContent = `Book ${selectedTimeSlots.length} Hour${selectedTimeSlots.length !== 1 ? 's' : ''}`;
            console.log('Book button enabled with text:', bookButton.textContent);
            
            // Enable only consecutive time slots
            highlightSelectableTimeSlots(roomWrapper);
        } else if (selectedTimeSlots.length > 0 && !isConsecutive) {
            bookButton.style.display = 'block';
            bookButton.disabled = true;
            bookButton.textContent = 'Please select consecutive hours';
            console.log('Book button disabled - non-consecutive selection');
            
            // Mark non-consecutive slots
            timeSlotElement.classList.add('time-slot--non-consecutive');
        } else {
            bookButton.style.display = 'none';
            console.log('Book button hidden - no selection');
            
            // Reset all time slots
            Array.from(roomWrapper.querySelectorAll('.time-slot')).forEach(slot => {
                if (!slot.classList.contains('time-slot--booked')) {
                    slot.classList.remove('time-slot--disabled');
                    slot.classList.remove('time-slot--non-consecutive');
                }
            });
        }
    }
    
    /**
     * Highlight time slots that are selectable (consecutive to current selection)
     * 
     * @param {HTMLElement} roomWrapper - The room wrapper element
     */
    function highlightSelectableTimeSlots(roomWrapper) {
        if (selectedTimeSlots.length === 0) return;
        
        // Get all time slots in this room
        const allSlots = Array.from(roomWrapper.querySelectorAll('.time-slot:not(.time-slot--booked)'));
        
        // Reset all slots first
        allSlots.forEach(slot => {
            slot.classList.remove('time-slot--disabled');
            slot.classList.remove('time-slot--non-consecutive');
        });
        
        // If there are multiple selected slots, they must form a continuous block
        if (selectedTimeSlots.length > 0) {
            // Slots that can be selected next are the ones immediately before or after the current selection
            const minTime = selectedTimeSlots[0];
            const maxTime = selectedTimeSlots[selectedTimeSlots.length - 1];
            
            // Get previous and next time slot
            const timeSlots = allSlots.map(slot => slot.dataset.time);
            const minIndex = timeSlots.indexOf(minTime);
            const maxIndex = timeSlots.indexOf(maxTime);
            const prevSlot = minIndex > 0 ? timeSlots[minIndex - 1] : null;
            const nextSlot = maxIndex < timeSlots.length - 1 ? timeSlots[maxIndex + 1] : null;
            
            // Disable all slots except the selected ones and the ones immediately before/after
            allSlots.forEach(slot => {
                const time = slot.dataset.time;
                if (!selectedTimeSlots.includes(time) && time !== prevSlot && time !== nextSlot) {
                    slot.classList.add('time-slot--disabled');
                }
            });
        }
    }
    
    /**
     * Check if time slots are consecutive
     * 
     * @param {Array} slots - Array of time slots (format: "HH:MM")
     * @returns {boolean} - True if slots are consecutive
     */
    function areConsecutiveTimeSlots(slots) {
        if (slots.length <= 1) return true;
        
        // Convert time slots to hour values
        const hours = slots.map(slot => parseInt(slot.split(':')[0]));
        
        // Sort hours
        hours.sort((a, b) => a - b);
        
        // Check if each hour is exactly one more than the previous
        for (let i = 1; i < hours.length; i++) {
            if (hours[i] !== hours[i-1] + 1) {
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * Reset time slot selection
     */
    function resetTimeSlotSelection() {
        selectedTimeSlots = [];
        
        // Reset all time slots
        document.querySelectorAll('.time-slot').forEach(slot => {
            slot.classList.remove('time-slot--selected');
            slot.classList.remove('time-slot--disabled');
            slot.classList.remove('time-slot--non-consecutive');
        });
        
        // Hide all book buttons
        document.querySelectorAll('.room-book-btn').forEach(btn => {
            btn.style.display = 'none';
            btn.textContent = 'Book Selected Times';
        });
        
        currentRoomSelection = {
            roomName: '',
            date: '',
            price: 0,
            availableSlots: []
        };
        
        // Reset member code verification if modal exists
        if (memberCodeContainer) {
            memberCodeContainer.classList.remove('verified');
            memberCodeContainer.classList.remove('error');
            
            if (memberCodeStatus) {
                memberCodeStatus.textContent = '';
            }
            
            if (memberCodeInput) {
                memberCodeInput.value = '';
                memberCodeInput.disabled = false;
            }
            
            if (verifyCodeButton) {
                verifyCodeButton.disabled = false;
            }
        }
        
        // Reset membership checkbox
        if (membershipCheck) {
            membershipCheck.checked = false;
            membershipCheck.disabled = false;
        }
    }
    
    /**
     * Open the booking modal with selected room details
     * 
     * @param {string} roomName - Name of the selected room
     * @param {string} date - Selected date string
     * @param {Array} timeSlots - Selected time slots
     * @param {number} price - Price per hour
     */
    function openBookingModal(roomName, date, timeSlots, price) {
        console.log('Opening booking modal for', roomName, 'on', date, 'with slots:', timeSlots);
        
        // Check if required elements exist
        if (!bookingModal) {
            console.error('Booking modal element not found.');
            return;
        }
        
        if (!modalRoomName || !modalDate || !modalTime) {
            console.error('Required modal elements not found:', {
                modalRoomName: !!modalRoomName,
                modalDate: !!modalDate,
                modalTime: !!modalTime
            });
            return;
        }
        
        // Keep the selected time slots (don't reset before displaying modal)
        const selectedSlots = [...timeSlots];
        
        // Reset membership verification state
        if (membershipCheck) {
            membershipCheck.checked = false;
            membershipCheck.disabled = false;
        }
        
        // Reset member code verification
        if (memberCodeContainer && memberCodeStatus && memberCodeInput) {
            // Show the member code container by default
            memberCodeContainer.style.display = 'block';
            memberCodeContainer.classList.remove('verified', 'error');
            memberCodeStatus.textContent = '';
            memberCodeInput.value = '';
            memberCodeInput.disabled = false;
            
            if (verifyCodeButton) {
                verifyCodeButton.disabled = false;
            }
        }
        
        // Update modal content
        modalRoomName.textContent = roomName;
        modalDate.textContent = formatDisplayDate(date);
        modalTime.textContent = formatTimeRange(selectedSlots);
        
        // Update hours information
        if (modalHours) {
            const hours = selectedSlots.length;
            modalHours.textContent = `${hours} hour${hours !== 1 ? 's' : ''}`;
            modalHours.dataset.hours = hours;
        }
        
        // Update pricing information
        if (modalPrice) {
            modalPrice.dataset.basePrice = price;
        }
        
        // Update standard and member prices
        if (modalStandardPrice) {
            const hours = selectedSlots.length;
            const standardTotal = price * hours;
            modalStandardPrice.textContent = `€${standardTotal.toFixed(2)}`;
            modalStandardPrice.classList.add('price-highlighted');
        }
        
        if (modalMemberPrice) {
            const hours = selectedSlots.length;
            const memberTotal = 1 * hours; // €1 per hour for members
            modalMemberPrice.textContent = `€${memberTotal.toFixed(2)}`;
            modalMemberPrice.classList.remove('price-highlighted');
        }
        
        // Update the total price
        updateModalPrice();
        
        // Show the modal
        bookingModal.classList.add('active');
        console.log('Modal displayed successfully');
    }
    
    /**
     * Format time slots array as a readable time range
     * 
     * @param {Array} timeSlots - Array of time strings (format: "HH:MM")
     * @returns {string} - Formatted time range
     */
    function formatTimeRange(timeSlots) {
        if (!timeSlots || timeSlots.length === 0) return '';
        
        if (timeSlots.length === 1) {
            return `${timeSlots[0]} - ${getNextHour(timeSlots[0])}`;
        }
        
        // Sort time slots
        const sortedSlots = [...timeSlots].sort();
        const firstSlot = sortedSlots[0];
        const lastSlot = sortedSlots[sortedSlots.length - 1];
        
        return `${firstSlot} - ${getNextHour(lastSlot)}`;
    }
    
    /**
     * Get the next hour from a time string
     * 
     * @param {string} timeString - Time string (format: "HH:MM")
     * @returns {string} - Next hour
     */
    function getNextHour(timeString) {
        const hour = parseInt(timeString.split(':')[0]);
        return `${hour + 1}:00`;
    }
    
    /**
     * Verify member code
     */
    function verifyMemberCode() {
        if (!memberCodeInput || !memberCodeContainer || !memberCodeStatus) {
            return;
        }
        
        const code = memberCodeInput.value.trim();
        
        if (!code) {
            memberCodeStatus.textContent = 'Please enter a member code';
            memberCodeContainer.classList.add('error');
            memberCodeContainer.classList.remove('verified');
            return;
        }
        
        // Check if code is valid (in a real app, this would be an API call)
        if (validMemberCodes.includes(code.toUpperCase())) {
            memberCodeStatus.textContent = 'Member code verified! €1/hour rate applied.';
            memberCodeContainer.classList.add('verified');
            memberCodeContainer.classList.remove('error');
            
            // Disable input and button after successful verification
            memberCodeInput.disabled = true;
            verifyCodeButton.disabled = true;
            
            // Uncheck the membership checkbox as it's now verified via code
            if (membershipCheck) {
                membershipCheck.checked = false;
                membershipCheck.disabled = true;
            }
            
            // Update price
            updateModalPrice();
        } else {
            memberCodeStatus.textContent = 'Invalid member code. Please try again.';
            memberCodeContainer.classList.add('error');
            memberCodeContainer.classList.remove('verified');
        }
    }
    
    /**
     * Update the price in the modal based on membership status
     */
    function updateModalPrice() {
        if (!modalTotalPrice) {
            console.error('modalTotalPrice element not found');
            return;
        }
        
        if (!modalHours) {
            console.error('modalHours element not found');
            return;
        }
        
        // Get base price from the dataset with fallback
        const basePrice = parseFloat(modalPrice?.dataset?.basePrice || 0);
        if (isNaN(basePrice)) {
            console.error('Invalid base price:', modalPrice?.dataset?.basePrice);
            return;
        }
        
        // Get hours from the dataset with fallback
        const hours = parseInt(modalHours.dataset.hours || 1);
        if (isNaN(hours)) {
            console.error('Invalid hours:', modalHours.dataset.hours);
            return;
        }
        
        console.log('Updating price calculation:', { basePrice, hours });
        
        // Check if member code is verified
        const isMemberCodeVerified = memberCodeContainer ? memberCodeContainer.classList.contains('verified') : false;
        
        // Check if membership checkbox is checked
        const isMemberCheckboxChecked = membershipCheck ? membershipCheck.checked : false;
        
        // Apply member price if either verification method is used
        const isMember = isMemberCodeVerified || isMemberCheckboxChecked;
        
        // Members pay €1/hour instead of regular price
        const pricePerHour = isMember ? 1.00 : basePrice;
        const totalPrice = pricePerHour * hours;
        
        console.log('Price calculation result:', { isMember, pricePerHour, totalPrice });
        
        // Update displayed total price
        modalTotalPrice.textContent = `€${totalPrice.toFixed(2)}`;
        modalTotalPrice.dataset.totalPrice = totalPrice;
        
        // Highlight the applicable price (standard or member)
        if (modalStandardPrice && modalMemberPrice) {
            if (isMember) {
                modalStandardPrice.classList.remove('price-highlighted');
                modalMemberPrice.classList.add('price-highlighted');
            } else {
                modalStandardPrice.classList.add('price-highlighted');
                modalMemberPrice.classList.remove('price-highlighted');
            }
        }
    }
    
    /**
     * Generate random booked time slots for demo purposes
     * 
     * @param {Array} timeSlots - Array of all time slots
     * @param {number} count - Number of slots to mark as booked
     * @returns {Array} - Array of booked time slots
     */
    function generateRandomBookedSlots(timeSlots, count) {
        const bookedSlots = [];
        const availableSlots = [...timeSlots];
        
        for (let i = 0; i < count && availableSlots.length > 0; i++) {
            const randomIndex = Math.floor(Math.random() * availableSlots.length);
            bookedSlots.push(availableSlots[randomIndex]);
            availableSlots.splice(randomIndex, 1);
        }
        
        return bookedSlots;
    }
    
    /**
     * Format a date as YYYY-MM-DD for input value
     * 
     * @param {Date} date - Date object to format
     * @returns {string} - Formatted date string
     */
    function formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        
        return `${year}-${month}-${day}`;
    }
    
    /**
     * Format a date for display
     * 
     * @param {string} dateString - Date string in YYYY-MM-DD format
     * @returns {string} - Formatted date for display
     */
    function formatDisplayDate(dateString) {
        const date = new Date(dateString);
        
        // Format the date based on the browser's locale
        return date.toLocaleDateString(undefined, {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
}