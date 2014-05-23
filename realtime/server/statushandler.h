#ifndef STATUSHANDLER_H
#define STATUSHANDLER_H

#include "jsonhandler.h"

class StatusHandler : public JSONHandler
{
protected:
    virtual void processData(const boost::property_tree::ptree &requestPt, boost::property_tree::ptree &responsePt);
};

#endif // STATUSHANDLER_H
