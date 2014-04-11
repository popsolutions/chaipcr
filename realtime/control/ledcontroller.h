#ifndef _LEDCONTROLLER_H_
#define _LEDCONTROLLER_H_

class SPIPort;

// Class LEDController
class LEDController {
public:
    LEDController(PWMPin &&grayscaleClock, std::shared_ptr<SPIPort> spiPort, GPIO &&potCSPin, GPIO &&ledXLATPin, PWMPin &&ledBlankPWM, float dutyCyclePercentage);
	virtual ~LEDController();
	
    void setIntensity(double onCurrentMilliamps);
    inline double intensity() const { return _intensity; }
    void activateLED(unsigned int ledNumber);
    void disableLEDs();

private:
    void sendLEDGrayscaleValues(const uint8_t (&values)[24]);
	
private:
    std::atomic<float> _dutyCyclePercentage;
    double _intensity;
	
	//components
    PWMPin _grayscaleClock;
    std::shared_ptr<SPIPort> _spiPort;
    GPIO _potCSPin;
    GPIO _ledXLATPin;
    PWMPin _ledBlankPWM;
};

#endif
