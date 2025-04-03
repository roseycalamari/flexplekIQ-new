/**
 * FlexPlek IQ - Kickback Calculator
 * Handles the kickback calculator functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    initKickbackCalculator();
});

/**
 * Initialize the kickback calculator functionality
 */
function initKickbackCalculator() {
    const revenueInput = document.getElementById('monthlyRevenue');
    const excessAmountElement = document.getElementById('excessAmount');
    const yourKickbackElement = document.getElementById('yourKickback');
    const annualReturnElement = document.getElementById('annualReturn');
    
    // Base costs value defined in the UI
    const baseCosts = 2200;
    
    if (revenueInput && excessAmountElement && yourKickbackElement && annualReturnElement) {
        // Calculate initial values
        calculateKickback();
        
        // Add event listener for input changes
        revenueInput.addEventListener('input', function() {
            calculateKickback();
        });
        
        /**
         * Calculate kickback values based on input
         */
        function calculateKickback() {
            // Get the revenue value
            let revenue = parseFloat(revenueInput.value);
            
            // Ensure revenue is not less than base costs
            if (isNaN(revenue) || revenue < baseCosts) {
                revenue = baseCosts;
                revenueInput.value = baseCosts;
            }
            
            // Calculate the excess amount
            const excessAmount = revenue - baseCosts;
            
            // Calculate your kickback (50% of excess)
            const yourKickback = excessAmount * 0.5;
            
            // Calculate annual return (kickback * 12 months)
            const annualReturn = yourKickback * 12;
            
            // Update the UI with formatted values
            excessAmountElement.textContent = `€${excessAmount.toFixed(2)}`;
            yourKickbackElement.textContent = `€${yourKickback.toFixed(2)}`;
            annualReturnElement.textContent = `€${annualReturn.toFixed(2)}`;
            
            // Add highlight animation to values
            highlightElement(excessAmountElement);
            highlightElement(yourKickbackElement);
            highlightElement(annualReturnElement);
        }
        
        /**
         * Add a brief highlight animation to an element
         * 
         * @param {HTMLElement} element - The element to highlight
         */
        function highlightElement(element) {
            element.classList.add('highlight');
            
            // Remove the highlight class after animation completes
            setTimeout(() => {
                element.classList.remove('highlight');
            }, 500);
        }
    }
}